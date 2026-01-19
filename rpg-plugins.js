/**
 * RPG Plugins System - Extensiones para Aventuras RPG v8
 * 
 * Este archivo permite crear items, efectos y mecánicas complejas
 * sin modificar el archivo principal.
 * 
 * HOOKS DISPONIBLES:
 * - onTurnStart(entity, isPlayer) → Se ejecuta al inicio de cada turno
 * - onTurnEnd(entity, isPlayer) → Se ejecuta al final de cada turno
 * - onCombatStart() → Al iniciar combate
 * - onCombatEnd(victory) → Al terminar combate
 * - onAttack(attacker, target, damage) → Al atacar (puede modificar daño)
 * - onDamage(entity, damage, source) → Al recibir daño (puede modificar daño)
 * - onHeal(entity, amount) → Al curarse
 * - onEquip(item, slot) → Al equipar item
 * - onUnequip(item, slot) → Al desequipar
 * - onExplore() → Al explorar
 * - onRest() → Al descansar en zona segura
 */

const Plugins = {
    // Registro de todos los plugins activos
    registry: [],
    
    // Items especiales con efectos complejos
    specialItems: {},
    
    // Efectos de estado personalizados
    customEffects: {},
    
    // Registro de un plugin
    register(plugin) {
        if (!plugin.id) {
            console.error('Plugin sin ID');
            return;
        }
        this.registry.push(plugin);
        console.log(`✨ Plugin registrado: ${plugin.name || plugin.id}`);
    },
    
    // Ejecutar un hook en todos los plugins
    trigger(hookName, ...args) {
        let result = null;
        this.registry.forEach(plugin => {
            if (typeof plugin[hookName] === 'function') {
                const r = plugin[hookName](...args);
                if (r !== undefined) result = r;
            }
        });
        return result;
    },
    
    // Registrar un item especial
    registerItem(itemDef) {
        this.specialItems[itemDef.id] = itemDef;
        console.log(`📦 Item especial registrado: ${itemDef.name}`);
    },
    
    // Registrar efecto personalizado
    registerEffect(effectDef) {
        this.customEffects[effectDef.id] = effectDef;
        console.log(`✨ Efecto registrado: ${effectDef.name}`);
    },
    
    // Obtener definición de item especial
    getSpecialItem(id) {
        return this.specialItems[id];
    },
    
    // Procesar efectos de items equipados
    processEquippedEffects(entity, hookName, ...args) {
        // Revisar arma
        if (entity.weapon) {
            const special = this.specialItems[entity.weapon.id];
            if (special && typeof special[hookName] === 'function') {
                special[hookName](entity, ...args);
            }
        }
        // Revisar armadura
        if (entity.armor) {
            const special = this.specialItems[entity.armor.id];
            if (special && typeof special[hookName] === 'function') {
                special[hookName](entity, ...args);
            }
        }
        // Revisar accesorios (si se implementan)
        if (entity.accessory) {
            const special = this.specialItems[entity.accessory.id];
            if (special && typeof special[hookName] === 'function') {
                special[hookName](entity, ...args);
            }
        }
        // Revisar inventario para items pasivos
        (entity.inv || []).forEach(item => {
            const special = this.specialItems[item.id];
            if (special && special.passive && typeof special[hookName] === 'function') {
                special[hookName](entity, item, ...args);
            }
        });
    },
    
    // Procesar efectos personalizados
    processCustomEffects(entity) {
        (entity.effects || []).forEach(eff => {
            const custom = this.customEffects[eff.type];
            if (custom && typeof custom.onTick === 'function') {
                custom.onTick(entity, eff);
            }
        });
    }
};

// ═══════════════════════════════════════════════════════════════════
// ITEMS ESPECIALES DE EJEMPLO
// ═══════════════════════════════════════════════════════════════════

/**
 * Orbe de Regeneración
 * Cura 1 HP al inicio de cada turno mientras está en el inventario
 */
Plugins.registerItem({
    id: 'orb_regen',
    name: 'Orbe de Regeneración',
    icon: '🔮',
    type: 'accessory',
    value: 100,
    rarity: 'epic',
    desc: 'Cura 1 HP al inicio de cada turno.',
    passive: true, // Se activa solo por tenerlo en inventario
    
    onTurnStart(entity, item) {
        if (entity.hp < entity.maxHp) {
            entity.hp = Math.min(entity.maxHp, entity.hp + 1);
            if (typeof Combat !== 'undefined' && G.combat) {
                Combat.log(`<span class="log-heal">🔮 Orbe regenera +1 HP</span>`);
            }
        }
    }
});

/**
 * Espada Vampírica
 * Roba 20% del daño causado como vida
 */
Plugins.registerItem({
    id: 'sword_vampire',
    name: 'Espada Vampírica',
    icon: '🗡️',
    damage: '1d8',
    weight: 3,
    value: 200,
    rarity: 'legendary',
    desc: 'Roba 20% del daño como vida.',
    
    onDealDamage(attacker, target, damage) {
        const stolen = Math.max(1, Math.floor(damage * 0.2));
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + stolen);
        if (typeof Combat !== 'undefined') {
            Combat.log(`<span class="log-heal">🩸 Vampirismo: +${stolen} HP</span>`);
        }
        return damage;
    }
});

/**
 * Escudo de Espinas
 * Refleja 25% del daño recibido al atacante
 */
Plugins.registerItem({
    id: 'shield_thorns',
    name: 'Escudo de Espinas',
    icon: '🛡️',
    defense: 3,
    weight: 4,
    value: 150,
    rarity: 'rare',
    desc: 'Refleja 25% del daño recibido.',
    
    onTakeDamage(defender, attacker, damage) {
        const reflected = Math.max(1, Math.floor(damage * 0.25));
        if (attacker && attacker.hp) {
            attacker.hp -= reflected;
            if (typeof Combat !== 'undefined') {
                Combat.log(`<span class="log-damage">🌵 Espinas reflejan ${reflected} daño a ${attacker.name}</span>`);
            }
        }
        return damage;
    }
});

/**
 * Amuleto de Velocidad
 * +3 velocidad mientras está equipado
 */
Plugins.registerItem({
    id: 'amulet_speed',
    name: 'Amuleto de Velocidad',
    icon: '⚡',
    type: 'accessory',
    value: 80,
    rarity: 'rare',
    desc: '+3 velocidad en combate.',
    speedBonus: 3,
    
    getSpeedBonus() {
        return 3;
    }
});

/**
 * Anillo de Crítico
 * +15% probabilidad de crítico
 */
Plugins.registerItem({
    id: 'ring_crit',
    name: 'Anillo del Crítico',
    icon: '💍',
    type: 'accessory',
    value: 120,
    rarity: 'epic',
    desc: '+15% probabilidad de crítico.',
    critBonus: 0.15,
    
    getCritBonus() {
        return 0.15;
    }
});

/**
 * Poción de Furia
 * Consumible: +50% daño por 3 turnos
 */
Plugins.registerItem({
    id: 'potion_fury',
    name: 'Poción de Furia',
    icon: '🧪',
    type: 'potion',
    value: 50,
    rarity: 'rare',
    desc: '+50% daño por 3 turnos.',
    
    onUse(entity, item) {
        // Agregar efecto de furia
        entity.effects = entity.effects || [];
        entity.effects.push({
            type: 'fury',
            turns: 3,
            damageBonus: 0.5
        });
        if (typeof Story !== 'undefined') {
            Story.add(`🔥 ¡${entity.name} entra en furia!`, 'combat');
        }
        return true; // Consumir item
    }
});

// ═══════════════════════════════════════════════════════════════════
// EFECTOS PERSONALIZADOS
// ═══════════════════════════════════════════════════════════════════

/**
 * Efecto: Furia
 * Aumenta el daño mientras está activo
 */
Plugins.registerEffect({
    id: 'fury',
    name: 'Furia',
    icon: '🔥',
    color: 'var(--orange)',
    
    onTick(entity, effect) {
        // El efecto se procesa en el cálculo de daño
    },
    
    getDamageMultiplier(effect) {
        return 1 + (effect.damageBonus || 0.5);
    }
});

/**
 * Efecto: Escudo Mágico
 * Absorbe cierta cantidad de daño
 */
Plugins.registerEffect({
    id: 'shield',
    name: 'Escudo',
    icon: '🛡️',
    color: 'var(--cyan)',
    
    onTakeDamage(entity, effect, damage) {
        const absorbed = Math.min(damage, effect.amount || 10);
        effect.amount -= absorbed;
        if (effect.amount <= 0) {
            entity.effects = entity.effects.filter(e => e !== effect);
        }
        if (typeof Combat !== 'undefined') {
            Combat.log(`<span class="log-heal">🛡️ Escudo absorbe ${absorbed} daño</span>`);
        }
        return damage - absorbed;
    }
});

/**
 * Efecto: Bendición
 * Cura al inicio de cada turno
 */
Plugins.registerEffect({
    id: 'bless',
    name: 'Bendición',
    icon: '✨',
    color: 'var(--gold)',
    
    onTick(entity, effect) {
        const heal = effect.healPerTurn || 2;
        if (entity.hp < entity.maxHp) {
            entity.hp = Math.min(entity.maxHp, entity.hp + heal);
            if (typeof Combat !== 'undefined' && G.combat) {
                Combat.log(`<span class="log-heal">✨ Bendición: +${heal} HP</span>`);
            }
        }
    }
});

// ═══════════════════════════════════════════════════════════════════
// PLUGIN DE EJEMPLO: Sistema de Combo
// ═══════════════════════════════════════════════════════════════════

Plugins.register({
    id: 'combo_system',
    name: 'Sistema de Combo',
    
    comboCount: 0,
    
    onCombatStart() {
        this.comboCount = 0;
    },
    
    onAttack(attacker, target, damage, hit) {
        if (!G.p || attacker !== G.p) return damage;
        
        if (hit) {
            this.comboCount++;
            if (this.comboCount >= 3) {
                const bonus = Math.floor(damage * 0.1 * (this.comboCount - 2));
                if (bonus > 0 && typeof Combat !== 'undefined') {
                    Combat.log(`<span class="log-crit">🔥 Combo x${this.comboCount}: +${bonus} daño</span>`);
                }
                return damage + bonus;
            }
        } else {
            this.comboCount = 0;
        }
        return damage;
    },
    
    onCombatEnd() {
        this.comboCount = 0;
    }
});

// ═══════════════════════════════════════════════════════════════════
// EXPORTAR PARA USO GLOBAL
// ═══════════════════════════════════════════════════════════════════

// Hacer disponible globalmente
window.Plugins = window.Plugins || {};

Plugins.specialItems = {};

console.log('🎮 RPG Plugins System cargado');
console.log(`   ${Object.keys(Plugins.specialItems).length} items especiales`);
console.log(`   ${Object.keys(Plugins.customEffects).length} efectos personalizados`);
console.log(`   ${Plugins.registry.length} plugins activos`);
