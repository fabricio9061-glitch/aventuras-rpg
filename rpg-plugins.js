/**
 * RPG Plugins System - Extensiones para Aventuras RPG v8
 * 
 * Este archivo permite crear items, efectos y mecánicas complejas
 * sin modificar el archivo principal.
 */

var Plugins = {
    // Registro de todos los plugins activos
    registry: [],
    
    // Items especiales con efectos complejos
    specialItems: {},
    
    // Efectos de estado personalizados
    customEffects: {},
    
    // Registro de un plugin
    register: function(plugin) {
        if (!plugin.id) {
            console.error('Plugin sin ID');
            return;
        }
        this.registry.push(plugin);
        console.log('✨ Plugin registrado: ' + (plugin.name || plugin.id));
    },
    
    // Ejecutar un hook en todos los plugins
    trigger: function(hookName) {
        var args = Array.prototype.slice.call(arguments, 1);
        var result = null;
        this.registry.forEach(function(plugin) {
            if (typeof plugin[hookName] === 'function') {
                var r = plugin[hookName].apply(plugin, args);
                if (r !== undefined) result = r;
            }
        });
        return result;
    },
    
    // Registrar un item especial
    registerItem: function(itemDef) {
        this.specialItems[itemDef.id] = itemDef;
        console.log('📦 Item registrado: ' + itemDef.name);
    },
    
    // Registrar efecto personalizado
    registerEffect: function(effectDef) {
        this.customEffects[effectDef.id] = effectDef;
        console.log('✨ Efecto registrado: ' + effectDef.name);
    },
    
    // Obtener definición de item especial
    getSpecialItem: function(id) {
        return this.specialItems[id];
    },
    
    // Procesar efectos de items equipados
    processEquippedEffects: function(entity, hookName) {
        var self = this;
        var args = Array.prototype.slice.call(arguments, 2);
        
        // Revisar arma
        if (entity.weapon) {
            var special = this.specialItems[entity.weapon.id];
            if (special && typeof special[hookName] === 'function') {
                special[hookName].apply(special, [entity].concat(args));
            }
        }
        // Revisar armadura
        if (entity.armor) {
            var special = this.specialItems[entity.armor.id];
            if (special && typeof special[hookName] === 'function') {
                special[hookName].apply(special, [entity].concat(args));
            }
        }
        // Revisar inventario para items pasivos
        (entity.inv || []).forEach(function(item) {
            var special = self.specialItems[item.id];
            if (special && special.passive && typeof special[hookName] === 'function') {
                special[hookName].apply(special, [entity, item].concat(args));
            }
        });
    }
};

// ═══════════════════════════════════════════════════════════════════
// ITEMS ESPECIALES
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
    passive: true,
    
    onTurnStart: function(entity, item) {
        if (entity.hp < entity.maxHp) {
            entity.hp = Math.min(entity.maxHp, entity.hp + 1);
            if (typeof Combat !== 'undefined' && typeof G !== 'undefined' && G.combat) {
                Combat.log('<span class="log-heal">🔮 +1 HP</span>');
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
    
    onDealDamage: function(attacker, target, damage) {
        var stolen = Math.max(1, Math.floor(damage * 0.2));
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + stolen);
        if (typeof Combat !== 'undefined') {
            Combat.log('<span class="log-heal">🩸 +' + stolen + ' HP</span>');
        }
        return damage;
    }
});

Plugins.registerItem({
    id: 'hammer_fire',
    name: 'Martillo de Fuego',
    icon: '🔥🔨',
    damage: '1d10',         // Daño base del arma
    weight: 5,
    value: 250,
    rarity: 'epic',
    desc: 'Hace daño extra de fuego y puede quemar al enemigo.',
    
    onDealDamage: function(attacker, target, damage) {
        // Daño extra de fuego: +2 fijo
        var fireDamage = 2;
        var totalDamage = damage + fireDamage;
        
        // Aplicar efecto de quemadura si el target tiene hp
        if (target && target.hp) {
            if (!target.effects) target.effects = [];
            target.effects.push({
                id: 'burn',
                name: 'Quemadura',
                duration: 3, // dura 3 turnos
                damagePerTurn: 1
            });
            if (typeof Combat !== 'undefined') {
                Combat.log('<span class="log-damage">🔥 Quemadura aplicada!</span>');
            }
        }
        
        if (typeof Combat !== 'undefined') {
            Combat.log('<span class="log-damage">🔥 +2 daño de fuego</span>');
        }
        
        return totalDamage;
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
    
    onTakeDamage: function(defender, attacker, damage) {
        var reflected = Math.max(1, Math.floor(damage * 0.25));
        if (attacker && attacker.hp) {
            attacker.hp -= reflected;
            if (typeof Combat !== 'undefined') {
                Combat.log('<span class="log-damage">🌵 ' + reflected + ' reflejado</span>');
            }
        }
        return damage;
    }
});

/**
 * Amuleto de Velocidad
 * +3 velocidad mientras está en inventario
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
    passive: true
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
    passive: true
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
    effect: '0',
    value: 50,
    rarity: 'rare',
    desc: '+50% daño por 3 turnos.'
});

/**
 * Daga Envenenada
 */
Plugins.registerItem({
    id: 'dagger_poison',
    name: 'Daga Envenenada',
    icon: '🗡️',
    damage: '1d4',
    weight: 1,
    value: 75,
    rarity: 'rare',
    effect: 'poison',
    desc: 'Envenena al enemigo.'
});

/**
 * Capa de Sombras
 */
Plugins.registerItem({
    id: 'cloak_shadow',
    name: 'Capa de Sombras',
    icon: '🧥',
    defense: 1,
    weight: 0,
    value: 90,
    rarity: 'rare',
    desc: '+2 evasión.',
    evasionBonus: 2
});

// ═══════════════════════════════════════════════════════════════════
// EFECTOS PERSONALIZADOS
// ═══════════════════════════════════════════════════════════════════

Plugins.registerEffect({
    id: 'fury',
    name: 'Furia',
    icon: '🔥',
    
    getDamageMultiplier: function(effect) {
        return 1 + (effect.damageBonus || 0.5);
    }
});

Plugins.registerEffect({
    id: 'shield',
    name: 'Escudo',
    icon: '🛡️',
    
    onTakeDamage: function(entity, effect, damage) {
        var absorbed = Math.min(damage, effect.amount || 10);
        effect.amount -= absorbed;
        if (effect.amount <= 0) {
            entity.effects = entity.effects.filter(function(e) { return e !== effect; });
        }
        if (typeof Combat !== 'undefined') {
            Combat.log('<span class="log-heal">🛡️ -' + absorbed + ' absorbido</span>');
        }
        return damage - absorbed;
    }
});

// ═══════════════════════════════════════════════════════════════════
// PLUGIN: Sistema de Combo
// ═══════════════════════════════════════════════════════════════════

Plugins.register({
    id: 'combo_system',
    name: 'Sistema de Combo',
    comboCount: 0,
    
    onCombatStart: function() {
        this.comboCount = 0;
    },
    
    onAttack: function(attacker, target, damage, hit) {
        if (typeof G === 'undefined' || !G.p || attacker !== G.p) return damage;
        
        if (hit) {
            this.comboCount++;
            if (this.comboCount >= 3) {
                var bonus = Math.floor(damage * 0.1 * (this.comboCount - 2));
                if (bonus > 0 && typeof Combat !== 'undefined') {
                    Combat.log('<span class="log-crit">🔥 Combo x' + this.comboCount + '</span>');
                }
                return damage + bonus;
            }
        } else {
            this.comboCount = 0;
        }
        return damage;
    },
    
    onCombatEnd: function() {
        this.comboCount = 0;
    }
});

// Log de inicialización
console.log('🎮 RPG Plugins cargado');
console.log('   Items: ' + Object.keys(Plugins.specialItems).length);
console.log('   Efectos: ' + Object.keys(Plugins.customEffects).length);
console.log('   Plugins: ' + Plugins.registry.length);
