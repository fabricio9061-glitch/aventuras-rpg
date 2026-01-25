/**
 * RPG Plugins System v15 - Extensiones Masivas
 * 
 * IMPORTANTE: Todos los IDs usan prefijo 'plg_' para identificarlos como items del plugin
 * Estos items NO se guardan en Firebase y siempre se recargan del plugin
 * 
 * Contenido:
 * - 5 regiones nuevas
 * - 35 enemigos con drops
 * - 12 mascotas
 * - 25 armas
 * - 12 armaduras
 * - 100+ items/materiales
 * - 20 accesorios especiales con efectos pasivos
 * - Sistema de hielo/congelación
 */

var Plugins = {
    registry: [],
    specialItems: {},
    customEffects: {},
    
    register: function(plugin) {
        if (!plugin.id) return;
        this.registry.push(plugin);
        console.log('✨ Plugin: ' + (plugin.name || plugin.id));
    },
    
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
    
    registerItem: function(def) { this.specialItems[def.id] = def; },
    registerEffect: function(def) { this.customEffects[def.id] = def; },
    getSpecialItem: function(id) { return this.specialItems[id]; },
    
    // Verificar si un ID es del plugin
    isPluginId: function(id) {
        return id && id.toString().startsWith('plg_');
    },
    
    processEquippedEffects: function(entity, hookName) {
        var self = this;
        var args = Array.prototype.slice.call(arguments, 2);
        if (entity.weapon) {
            var special = this.specialItems[entity.weapon.id];
            if (special && typeof special[hookName] === 'function') {
                special[hookName].apply(special, [entity].concat(args));
            }
        }
        if (entity.armor) {
            var special = this.specialItems[entity.armor.id];
            if (special && typeof special[hookName] === 'function') {
                special[hookName].apply(special, [entity].concat(args));
            }
        }
        (entity.inv || []).forEach(function(item) {
            var special = self.specialItems[item.id];
            if (special && special.passive && typeof special[hookName] === 'function') {
                special[hookName].apply(special, [entity, item].concat(args));
            }
        });
    }
};

// ═══════════════════════════════════════════════════════════════════
// EFECTOS DE ESTADO
// ═══════════════════════════════════════════════════════════════════

Plugins.registerEffect({ id: 'ice', name: 'Hielo', icon: '❄️', freezeChance: 0.30 });
Plugins.registerEffect({ id: 'fury', name: 'Furia', icon: '🔥', getDamageMultiplier: function() { return 1.5; } });
Plugins.registerEffect({ id: 'shield', name: 'Escudo', icon: '🛡️' });

// ═══════════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL DE INYECCIÓN
// ═══════════════════════════════════════════════════════════════════

function loadPluginItems() {
    if (typeof Data === 'undefined') {
        setTimeout(loadPluginItems, 100);
        return;
    }
    
    console.log('🔌 Cargando datos del plugin...');
    
    // Limpiar items del plugin anteriores (para evitar duplicados)
    ['regions','enemies','pets','weapons','armors','items','spells'].forEach(function(key) {
        if (Data[key]) {
            Data[key] = Data[key].filter(function(item) {
                return !item.id || !item.id.toString().startsWith('plg_');
            });
        }
    });

    // ═══════════════════════════════════════════════════════════════
    // 5 REGIONES NUEVAS
    // ═══════════════════════════════════════════════════════════════
    
    var newRegions = [
        {id:'plg_catacumbas',name:'Catacumbas Olvidadas',icon:'💀',type:'dangerous',danger:4,
            encounters:['plg_skeleton','plg_ghost','plg_vampire','plg_necromancer','plg_lich'],
            desc:'Tumbas antiguas llenas de no-muertos.',connections:['mazmorra']},
        {id:'plg_volcan',name:'Volcán Ardiente',icon:'🌋',type:'dangerous',danger:5,
            encounters:['plg_fire_elem','plg_salamander','plg_dragon_young','plg_lava_golem','plg_phoenix'],
            desc:'El calor es insoportable. Solo los valientes sobreviven.',connections:['montana','desierto']},
        {id:'plg_abismo',name:'Abismo Marino',icon:'🌊',type:'dangerous',danger:4,
            encounters:['plg_crab','plg_shark','plg_kraken_tentacle','plg_mermaid','plg_sea_serpent'],
            desc:'Las profundidades oceánicas esconden horrores.',connections:['pantano']},
        {id:'plg_torre',name:'Torre del Mago',icon:'🏰',type:'dangerous',danger:3,
            encounters:['plg_golem','plg_gargoyle','plg_imp','plg_wizard','plg_elemental'],
            desc:'Una torre llena de experimentos mágicos.',connections:['pueblo','bosque']},
        {id:'plg_cementerio',name:'Cementerio Maldito',icon:'🪦',type:'dangerous',danger:3,
            encounters:['plg_zombie','plg_skeleton','plg_ghost','plg_banshee','plg_ghoul'],
            desc:'Los muertos no descansan en paz aquí.',connections:['pueblo','bosque']}
    ];
    
    newRegions.forEach(function(r) { r.fromPlugin = true; Data.regions.push(r); });

    // ═══════════════════════════════════════════════════════════════
    // 100+ ITEMS Y MATERIALES
    // ═══════════════════════════════════════════════════════════════
    
    var newItems = [
        // Materiales de monstruos
        {id:'plg_silk',name:'Hilo de Araña',type:'misc',icon:'🕸️',value:8,rarity:'common',desc:'Seda resistente.'},
        {id:'plg_fang',name:'Colmillo',type:'misc',icon:'🦷',value:12,rarity:'common',desc:'Colmillo afilado.'},
        {id:'plg_scale',name:'Escama de Dragón',type:'misc',icon:'🐉',value:50,rarity:'epic',desc:'Escama brillante.'},
        {id:'plg_bone',name:'Hueso',type:'misc',icon:'🦴',value:5,rarity:'common',desc:'Hueso de criatura.'},
        {id:'plg_leather',name:'Cuero Crudo',type:'misc',icon:'🟫',value:10,rarity:'common',desc:'Piel sin curtir.'},
        {id:'plg_fur',name:'Piel de Oso',type:'misc',icon:'🧸',value:25,rarity:'rare',desc:'Pelaje grueso.'},
        {id:'plg_claw',name:'Garra',type:'misc',icon:'🦎',value:30,rarity:'rare',desc:'Garra enorme.'},
        {id:'plg_eye',name:'Ojo Mágico',type:'misc',icon:'👁️',value:45,rarity:'epic',desc:'Ojo con poder.'},
        {id:'plg_horn',name:'Cuerno',type:'misc',icon:'🐂',value:40,rarity:'rare',desc:'Cuerno macizo.'},
        {id:'plg_wing',name:'Ala de Murciélago',type:'misc',icon:'🦇',value:15,rarity:'common',desc:'Membrana de ala.'},
        {id:'plg_slime',name:'Gelatina',type:'misc',icon:'🟢',value:6,rarity:'common',desc:'Sustancia viscosa.'},
        {id:'plg_venom',name:'Veneno',type:'misc',icon:'🐍',value:20,rarity:'rare',desc:'Toxina mortal.'},
        {id:'plg_feather',name:'Pluma Dorada',type:'misc',icon:'🪶',value:35,rarity:'rare',desc:'Pluma mágica.'},
        {id:'plg_pearl',name:'Perla Marina',type:'misc',icon:'🫧',value:55,rarity:'epic',desc:'Perla brillante.'},
        {id:'plg_crystal',name:'Cristal Mágico',type:'misc',icon:'💎',value:60,rarity:'epic',desc:'Cristal arcano.'},
        {id:'plg_ember',name:'Brasa Elemental',type:'misc',icon:'🔥',value:40,rarity:'rare',desc:'Fuego eterno.'},
        {id:'plg_frost',name:'Esencia de Hielo',type:'misc',icon:'❄️',value:40,rarity:'rare',desc:'Frío eterno.'},
        {id:'plg_shadow',name:'Esencia Oscura',type:'misc',icon:'🌑',value:50,rarity:'epic',desc:'Sombra condensada.'},
        {id:'plg_heart',name:'Corazón de Bestia',type:'misc',icon:'❤️',value:35,rarity:'rare',desc:'Corazón latiente.'},
        {id:'plg_tooth',name:'Diente de Tiburón',type:'misc',icon:'🦈',value:18,rarity:'common',desc:'Diente serrado.'},
        {id:'plg_shell',name:'Caparazón',type:'misc',icon:'🐚',value:12,rarity:'common',desc:'Concha dura.'},
        {id:'plg_antenna',name:'Antena',type:'misc',icon:'🐜',value:8,rarity:'common',desc:'Sensor de insecto.'},
        {id:'plg_stinger',name:'Aguijón',type:'misc',icon:'🐝',value:15,rarity:'common',desc:'Aguijón venenoso.'},
        {id:'plg_mucus',name:'Mucosidad',type:'misc',icon:'💧',value:4,rarity:'common',desc:'Baba pegajosa.'},
        {id:'plg_tail',name:'Cola de Lagarto',type:'misc',icon:'🦎',value:10,rarity:'common',desc:'Se regenera.'},
        {id:'plg_goblin_ear',name:'Oreja de Goblin',type:'misc',icon:'👂',value:7,rarity:'common',desc:'Trofeo de caza.'},
        {id:'plg_wolf_pelt',name:'Piel de Lobo',type:'misc',icon:'🐺',value:20,rarity:'common',desc:'Pelaje gris.'},
        {id:'plg_spider_leg',name:'Pata de Araña',type:'misc',icon:'🦵',value:6,rarity:'common',desc:'Articulada.'},
        {id:'plg_rat_tail',name:'Cola de Rata',type:'misc',icon:'🐀',value:3,rarity:'common',desc:'Asquerosa.'},
        {id:'plg_bat_fang',name:'Colmillo de Murciélago',type:'misc',icon:'🦷',value:8,rarity:'common',desc:'Pequeño y afilado.'},
        {id:'plg_ectoplasm',name:'Ectoplasma',type:'misc',icon:'👻',value:30,rarity:'rare',desc:'Sustancia fantasmal.'},
        {id:'plg_zombie_flesh',name:'Carne Podrida',type:'misc',icon:'🧟',value:5,rarity:'common',desc:'Huele terrible.'},
        {id:'plg_skull',name:'Cráneo',type:'misc',icon:'💀',value:15,rarity:'common',desc:'Macabro pero útil.'},
        {id:'plg_demon_horn',name:'Cuerno de Demonio',type:'misc',icon:'😈',value:70,rarity:'epic',desc:'Poder infernal.'},
        {id:'plg_angel_feather',name:'Pluma de Ángel',type:'misc',icon:'🪽',value:80,rarity:'legendary',desc:'Pureza divina.'},
        {id:'plg_phoenix_ash',name:'Ceniza de Fénix',type:'misc',icon:'🔥',value:100,rarity:'legendary',desc:'Renacimiento.'},
        {id:'plg_dragon_blood',name:'Sangre de Dragón',type:'misc',icon:'🩸',value:90,rarity:'legendary',desc:'Poder ancestral.'},
        {id:'plg_mermaid_scale',name:'Escama de Sirena',type:'misc',icon:'🧜',value:65,rarity:'epic',desc:'Brilla bajo el agua.'},
        {id:'plg_kraken_ink',name:'Tinta de Kraken',type:'misc',icon:'🦑',value:55,rarity:'epic',desc:'Oscuridad líquida.'},
        {id:'plg_golem_core',name:'Núcleo de Golem',type:'misc',icon:'🤖',value:60,rarity:'epic',desc:'Energía animadora.'},
        
        // Gemas y minerales
        {id:'plg_ruby',name:'Rubí',type:'misc',icon:'🔴',value:80,rarity:'epic',desc:'Gema roja.'},
        {id:'plg_sapphire',name:'Zafiro',type:'misc',icon:'🔵',value:80,rarity:'epic',desc:'Gema azul.'},
        {id:'plg_emerald',name:'Esmeralda',type:'misc',icon:'🟢',value:80,rarity:'epic',desc:'Gema verde.'},
        {id:'plg_diamond',name:'Diamante',type:'misc',icon:'💠',value:150,rarity:'legendary',desc:'La más dura.'},
        {id:'plg_amethyst',name:'Amatista',type:'misc',icon:'🟣',value:60,rarity:'rare',desc:'Gema púrpura.'},
        {id:'plg_topaz',name:'Topacio',type:'misc',icon:'🟡',value:60,rarity:'rare',desc:'Gema amarilla.'},
        {id:'plg_opal',name:'Ópalo',type:'misc',icon:'⚪',value:70,rarity:'epic',desc:'Gema iridiscente.'},
        {id:'plg_onyx',name:'Ónix',type:'misc',icon:'⚫',value:70,rarity:'epic',desc:'Gema negra.'},
        {id:'plg_iron',name:'Mineral de Hierro',type:'misc',icon:'🪨',value:15,rarity:'common',desc:'Metal común.'},
        {id:'plg_gold',name:'Pepita de Oro',type:'misc',icon:'🥇',value:50,rarity:'rare',desc:'Oro puro.'},
        {id:'plg_silver',name:'Plata',type:'misc',icon:'🥈',value:30,rarity:'rare',desc:'Metal precioso.'},
        {id:'plg_mithril',name:'Mithril',type:'misc',icon:'✨',value:100,rarity:'epic',desc:'Metal élfico.'},
        {id:'plg_adamantine',name:'Adamantina',type:'misc',icon:'💎',value:120,rarity:'legendary',desc:'Metal indestructible.'},
        
        // Hierbas y plantas
        {id:'plg_herb_heal',name:'Hierba Curativa',type:'misc',icon:'🌿',value:10,rarity:'common',desc:'Planta medicinal.'},
        {id:'plg_herb_mana',name:'Flor de Maná',type:'misc',icon:'🌸',value:15,rarity:'common',desc:'Restaura maná.'},
        {id:'plg_herb_poison',name:'Belladona',type:'misc',icon:'🍇',value:12,rarity:'common',desc:'Planta venenosa.'},
        {id:'plg_herb_rare',name:'Raíz Arcana',type:'misc',icon:'🌱',value:40,rarity:'rare',desc:'Ingrediente raro.'},
        {id:'plg_mushroom_red',name:'Hongo Rojo',type:'misc',icon:'🍄',value:8,rarity:'common',desc:'¿Comestible?'},
        {id:'plg_mushroom_blue',name:'Hongo Azul',type:'misc',icon:'🍄',value:25,rarity:'rare',desc:'Propiedades mágicas.'},
        {id:'plg_lotus',name:'Loto Negro',type:'misc',icon:'🪷',value:50,rarity:'epic',desc:'Flor de la muerte.'},
        {id:'plg_mandrake',name:'Mandrágora',type:'misc',icon:'🥕',value:45,rarity:'rare',desc:'Grita al arrancarla.'},
        
        // Objetos varios
        {id:'plg_key_gold',name:'Llave Dorada',type:'misc',icon:'🗝️',value:30,rarity:'rare',desc:'Abre cofres especiales.'},
        {id:'plg_map',name:'Mapa del Tesoro',type:'misc',icon:'🗺️',value:40,rarity:'rare',desc:'X marca el lugar.'},
        {id:'plg_coin_ancient',name:'Moneda Antigua',type:'misc',icon:'🪙',value:25,rarity:'rare',desc:'Coleccionable.'},
        {id:'plg_book_spell',name:'Tomo Arcano',type:'misc',icon:'📕',value:60,rarity:'epic',desc:'Conocimiento mágico.'},
        {id:'plg_scroll',name:'Pergamino',type:'misc',icon:'📜',value:15,rarity:'common',desc:'Listo para escribir.'},
        {id:'plg_rope',name:'Cuerda',type:'misc',icon:'🪢',value:8,rarity:'common',desc:'Siempre útil.'},
        {id:'plg_torch',name:'Antorcha',type:'misc',icon:'🔦',value:5,rarity:'common',desc:'Ilumina.'},
        {id:'plg_lantern',name:'Linterna',type:'misc',icon:'🏮',value:20,rarity:'common',desc:'Luz duradera.'},
        {id:'plg_compass',name:'Brújula',type:'misc',icon:'🧭',value:30,rarity:'rare',desc:'Nunca te pierdas.'},
        {id:'plg_mirror',name:'Espejo Mágico',type:'misc',icon:'🪞',value:45,rarity:'rare',desc:'Refleja más que luz.'},
        {id:'plg_hourglass',name:'Reloj de Arena',type:'misc',icon:'⏳',value:35,rarity:'rare',desc:'El tiempo fluye.'},
        
        // Comidas
        {id:'plg_bread',name:'Pan',type:'food',icon:'🍞',value:5,rarity:'common',foodValue:3,desc:'Pan fresco.'},
        {id:'plg_cheese',name:'Queso',type:'food',icon:'🧀',value:8,rarity:'common',foodValue:4,desc:'Queso curado.'},
        {id:'plg_apple',name:'Manzana',type:'food',icon:'🍎',value:3,rarity:'common',foodValue:2,desc:'Fruta fresca.'},
        {id:'plg_fish',name:'Pescado',type:'food',icon:'🐟',value:10,rarity:'common',foodValue:5,desc:'Pescado cocinado.'},
        {id:'plg_stew',name:'Estofado',type:'food',icon:'🍲',value:20,rarity:'rare',foodValue:8,desc:'Muy nutritivo.'},
        {id:'plg_meat',name:'Carne Asada',type:'food',icon:'🍖',value:12,rarity:'common',foodValue:6,desc:'Carne jugosa.'},
        {id:'plg_pie',name:'Pastel',type:'food',icon:'🥧',value:15,rarity:'rare',foodValue:7,desc:'Delicioso.'},
        {id:'plg_honey',name:'Miel',type:'food',icon:'🍯',value:18,rarity:'rare',foodValue:5,desc:'Dulce energía.'},
        {id:'plg_wine',name:'Vino',type:'food',icon:'🍷',value:25,rarity:'rare',foodValue:4,desc:'Calienta el alma.'},
        
        // Pociones
        {id:'plg_pot_mana',name:'Poción de Maná',type:'potion',icon:'🧪',value:25,rarity:'common',potionType:'mana',effect:'2d8',desc:'Restaura maná.'},
        {id:'plg_pot_invis',name:'Poción de Invisibilidad',type:'escape',icon:'👻',value:60,rarity:'epic',desc:'Escapa del combate.'},
        {id:'plg_pot_giant',name:'Poción de Gigante',type:'potion',icon:'🧪',value:50,rarity:'rare',effect:'0',desc:'+5 daño por 3 turnos.'},
        {id:'plg_pot_speed',name:'Poción de Velocidad',type:'potion',icon:'⚡',value:45,rarity:'rare',effect:'0',desc:'+5 velocidad por 3 turnos.'},
        {id:'plg_pot_stone',name:'Poción de Piedra',type:'potion',icon:'🪨',value:55,rarity:'rare',effect:'0',desc:'+5 armadura por 3 turnos.'},
        {id:'plg_pot_fire_res',name:'Resistencia al Fuego',type:'potion',icon:'🔥',value:40,rarity:'rare',effect:'0',desc:'Inmune al fuego 3 turnos.'},
        {id:'plg_pot_ice_res',name:'Resistencia al Hielo',type:'potion',icon:'❄️',value:40,rarity:'rare',effect:'0',desc:'Inmune al hielo 3 turnos.'},
        {id:'plg_elixir',name:'Elixir de Vida',type:'potion',icon:'✨',value:100,rarity:'legendary',effect:'10d6',desc:'Restaura toda la vida.'}
    ];
    
    newItems.forEach(function(i) { i.fromPlugin = true; Data.items.push(i); });

    // ═══════════════════════════════════════════════════════════════
    // 20 ACCESORIOS ESPECIALES CON EFECTOS PASIVOS
    // ═══════════════════════════════════════════════════════════════
    
    var newAccessories = [
        {id:'plg_acc_regen',name:'Orbe de Regeneración',type:'accessory',icon:'🔮',value:100,rarity:'epic',
            desc:'Cura 1 HP al inicio de cada turno.',passive:true,effectType:'regen'},
        {id:'plg_acc_speed',name:'Botas de Velocidad',type:'accessory',icon:'👢',value:80,rarity:'rare',
            desc:'+3 velocidad en combate.',passive:true,speedBonus:3},
        {id:'plg_acc_crit',name:'Anillo del Crítico',type:'accessory',icon:'💍',value:120,rarity:'epic',
            desc:'+15% probabilidad de crítico.',passive:true,critBonus:0.15},
        {id:'plg_acc_dodge',name:'Capa de Evasión',type:'accessory',icon:'🧥',value:90,rarity:'rare',
            desc:'+2 evasión.',passive:true,evasionBonus:2},
        {id:'plg_acc_thorns',name:'Anillo de Espinas',type:'accessory',icon:'🌹',value:110,rarity:'epic',
            desc:'Refleja 15% del daño recibido.',passive:true,thornsDamage:0.15},
        {id:'plg_acc_lifesteal',name:'Amuleto Vampírico',type:'accessory',icon:'🩸',value:130,rarity:'epic',
            desc:'Roba 10% del daño como vida.',passive:true,lifesteal:0.10},
        {id:'plg_acc_mana',name:'Gema de Maná',type:'accessory',icon:'💙',value:85,rarity:'rare',
            desc:'+20 maná máximo.',passive:true,manaBonus:20},
        {id:'plg_acc_xp',name:'Amuleto de Sabiduría',type:'accessory',icon:'📿',value:95,rarity:'rare',
            desc:'+25% experiencia ganada.',passive:true,xpBonus:0.25},
        {id:'plg_acc_gold',name:'Talismán de Fortuna',type:'accessory',icon:'🍀',value:100,rarity:'rare',
            desc:'+30% oro encontrado.',passive:true,goldBonus:0.30},
        {id:'plg_acc_armor',name:'Escudo Protector',type:'accessory',icon:'🛡️',value:90,rarity:'rare',
            desc:'+2 armadura pasiva.',passive:true,armorBonus:2},
        {id:'plg_acc_damage',name:'Guantelete de Poder',type:'accessory',icon:'🧤',value:105,rarity:'epic',
            desc:'+2 daño a todos los ataques.',passive:true,damageBonus:2},
        {id:'plg_acc_first',name:'Amuleto de Iniciativa',type:'accessory',icon:'⚡',value:75,rarity:'rare',
            desc:'Siempre actúas primero.',passive:true,initiativeBonus:100},
        {id:'plg_acc_poison_immune',name:'Perla Purificadora',type:'accessory',icon:'🫧',value:70,rarity:'rare',
            desc:'Inmune al veneno.',passive:true,poisonImmune:true},
        {id:'plg_acc_fire_immune',name:'Rubí del Fénix',type:'accessory',icon:'🔴',value:85,rarity:'epic',
            desc:'Inmune al fuego.',passive:true,fireImmune:true},
        {id:'plg_acc_ice_immune',name:'Zafiro Glacial',type:'accessory',icon:'🔵',value:85,rarity:'epic',
            desc:'Inmune al hielo/congelación.',passive:true,iceImmune:true},
        {id:'plg_acc_lucky',name:'Trébol de 4 Hojas',type:'accessory',icon:'🍀',value:60,rarity:'rare',
            desc:'+10% probabilidad de drops raros.',passive:true,luckBonus:0.10},
        {id:'plg_acc_survivor',name:'Amuleto del Superviviente',type:'accessory',icon:'💚',value:150,rarity:'legendary',
            desc:'Una vez por combate, sobrevive con 1 HP.',passive:true,surviveOnce:true},
        {id:'plg_acc_double',name:'Guantes de Doble Golpe',type:'accessory',icon:'🥊',value:140,rarity:'legendary',
            desc:'20% de atacar dos veces.',passive:true,doubleAttack:0.20},
        {id:'plg_acc_counter',name:'Brazalete de Contraataque',type:'accessory',icon:'⚔️',value:120,rarity:'epic',
            desc:'25% de contraatacar al ser golpeado.',passive:true,counterAttack:0.25},
        {id:'plg_acc_heal_boost',name:'Cruz Sagrada',type:'accessory',icon:'✝️',value:80,rarity:'rare',
            desc:'+50% efectividad de curación.',passive:true,healBonus:0.50}
    ];
    
    newAccessories.forEach(function(a) { a.fromPlugin = true; Data.items.push(a); });
    
    // Registrar accesorios como items especiales para sus efectos
    newAccessories.forEach(function(a) {
        Plugins.registerItem({
            id: a.id,
            name: a.name,
            icon: a.icon,
            passive: true,
            speedBonus: a.speedBonus || 0,
            critBonus: a.critBonus || 0,
            evasionBonus: a.evasionBonus || 0,
            armorBonus: a.armorBonus || 0,
            damageBonus: a.damageBonus || 0,
            manaBonus: a.manaBonus || 0,
            lifesteal: a.lifesteal || 0,
            thornsDamage: a.thornsDamage || 0,
            
            onTurnStart: function(entity, item) {
                // Regeneración
                if (a.effectType === 'regen' && entity.hp < entity.maxHp) {
                    entity.hp = Math.min(entity.maxHp, entity.hp + 1);
                    if (typeof Combat !== 'undefined' && G.combat) {
                        Combat.log('<span class="log-heal">🔮 +1 HP (regeneración)</span>');
                    }
                }
            },
            
            onDealDamage: function(attacker, target, damage) {
                // Lifesteal
                if (a.lifesteal && a.lifesteal > 0) {
                    var stolen = Math.max(1, Math.floor(damage * a.lifesteal));
                    attacker.hp = Math.min(attacker.maxHp, attacker.hp + stolen);
                    if (typeof Combat !== 'undefined') {
                        Combat.log('<span class="log-heal">🩸 +' + stolen + ' HP vampírico</span>');
                    }
                }
                return damage;
            },
            
            onTakeDamage: function(defender, attacker, damage) {
                // Thorns
                if (a.thornsDamage && a.thornsDamage > 0 && attacker && attacker.hp) {
                    var reflected = Math.max(1, Math.floor(damage * a.thornsDamage));
                    attacker.hp -= reflected;
                    if (typeof Combat !== 'undefined') {
                        Combat.log('<span class="log-damage">🌹 ' + reflected + ' reflejado</span>');
                    }
                }
                return damage;
            }
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 25 ARMAS
    // ═══════════════════════════════════════════════════════════════
    
    var newWeapons = [
        // Físicas
        {id:'plg_wpn_short',name:'Espada Corta',damage:'1d6',icon:'🗡️',value:25,rarity:'common',weight:2,magic:false},
        {id:'plg_wpn_long',name:'Espada Larga',damage:'1d8',icon:'⚔️',value:50,rarity:'rare',weight:3,magic:false},
        {id:'plg_wpn_great',name:'Mandoble',damage:'2d6',icon:'⚔️',value:100,rarity:'epic',weight:6,magic:false},
        {id:'plg_wpn_rapier',name:'Estoque',damage:'1d6',icon:'🤺',value:45,rarity:'rare',weight:1,magic:false},
        {id:'plg_wpn_scimitar',name:'Cimitarra',damage:'1d6',icon:'🔪',value:40,rarity:'rare',weight:2,magic:false},
        {id:'plg_wpn_axe',name:'Hacha de Batalla',damage:'1d10',icon:'🪓',value:60,rarity:'rare',weight:5,magic:false},
        {id:'plg_wpn_hammer',name:'Martillo de Guerra',damage:'1d10',icon:'🔨',value:65,rarity:'rare',weight:6,magic:false},
        {id:'plg_wpn_mace',name:'Maza',damage:'1d6',icon:'⚒️',value:30,rarity:'common',weight:4,magic:false},
        {id:'plg_wpn_flail',name:'Mangual',damage:'1d8',icon:'⛓️',value:45,rarity:'rare',weight:4,magic:false},
        {id:'plg_wpn_spear',name:'Lanza',damage:'1d8',icon:'🔱',value:35,rarity:'common',weight:3,magic:false},
        {id:'plg_wpn_halberd',name:'Alabarda',damage:'1d10',icon:'🔱',value:70,rarity:'rare',weight:5,magic:false},
        {id:'plg_wpn_bow',name:'Arco Largo',damage:'1d8',icon:'🏹',value:55,rarity:'rare',weight:2,magic:false},
        {id:'plg_wpn_xbow',name:'Ballesta',damage:'1d10',icon:'🎯',value:75,rarity:'rare',weight:4,magic:false},
        {id:'plg_wpn_katana',name:'Katana',damage:'1d10',icon:'⚔️',value:90,rarity:'epic',weight:2,magic:false},
        {id:'plg_wpn_club',name:'Garrote',damage:'1d4',icon:'🪵',value:5,rarity:'common',weight:3,magic:false},
        {id:'plg_wpn_whip',name:'Látigo',damage:'1d4',icon:'〰️',value:20,rarity:'common',weight:1,magic:false},
        {id:'plg_wpn_trident',name:'Tridente',damage:'1d8',icon:'🔱',value:55,rarity:'rare',weight:3,magic:false},
        // Mágicas
        {id:'plg_wpn_staff_fire',name:'Bastón de Fuego',damage:'1d6',icon:'🔥',value:80,rarity:'rare',weight:2,magic:true,manaBonus:15,effect:'fire'},
        {id:'plg_wpn_staff_ice',name:'Bastón de Hielo',damage:'1d6',icon:'❄️',value:80,rarity:'rare',weight:2,magic:true,manaBonus:15,effect:'ice'},
        {id:'plg_wpn_staff_thunder',name:'Bastón del Trueno',damage:'1d8',icon:'⚡',value:100,rarity:'epic',weight:2,magic:true,manaBonus:20},
        {id:'plg_wpn_staff_nature',name:'Bastón de Naturaleza',damage:'1d4',icon:'🌿',value:70,rarity:'rare',weight:1,magic:true,manaBonus:25},
        {id:'plg_wpn_staff_dark',name:'Bastón Oscuro',damage:'1d10',icon:'🌑',value:120,rarity:'epic',weight:3,magic:true,manaBonus:10},
        {id:'plg_wpn_staff_arcane',name:'Bastón Arcano',damage:'1d8',icon:'🔮',value:150,rarity:'legendary',weight:2,magic:true,manaBonus:30},
        {id:'plg_wpn_wand',name:'Varita Mágica',damage:'1d4',icon:'✨',value:40,rarity:'common',weight:0,magic:true,manaBonus:10},
        {id:'plg_wpn_orb',name:'Orbe de Poder',damage:'1d6',icon:'🔮',value:90,rarity:'epic',weight:1,magic:true,manaBonus:20}
    ];
    
    newWeapons.forEach(function(w) { w.fromPlugin = true; Data.weapons.push(w); });

    // ═══════════════════════════════════════════════════════════════
    // 12 ARMADURAS
    // ═══════════════════════════════════════════════════════════════
    
    var newArmors = [
        {id:'plg_arm_padded',name:'Armadura Acolchada',defense:1,icon:'👕',value:15,rarity:'common',weight:1},
        {id:'plg_arm_leather',name:'Cuero Endurecido',defense:2,icon:'🦺',value:35,rarity:'common',weight:2},
        {id:'plg_arm_studded',name:'Cuero Tachonado',defense:3,icon:'🦺',value:50,rarity:'rare',weight:3},
        {id:'plg_arm_chain',name:'Cota de Malla',defense:4,icon:'⛓️',value:80,rarity:'rare',weight:5},
        {id:'plg_arm_scale',name:'Armadura de Escamas',defense:4,icon:'🐉',value:90,rarity:'rare',weight:5},
        {id:'plg_arm_breast',name:'Coraza',defense:5,icon:'🛡️',value:120,rarity:'epic',weight:4},
        {id:'plg_arm_half',name:'Media Armadura',defense:6,icon:'🛡️',value:150,rarity:'epic',weight:6},
        {id:'plg_arm_full',name:'Armadura Completa',defense:8,icon:'⚔️',value:250,rarity:'legendary',weight:8},
        {id:'plg_arm_mage',name:'Túnica de Mago',defense:1,icon:'🧥',value:60,rarity:'rare',weight:0,magic:true,manaBonus:20},
        {id:'plg_arm_archmage',name:'Túnica de Archimago',defense:2,icon:'🧙',value:150,rarity:'legendary',weight:0,magic:true,manaBonus:40},
        {id:'plg_arm_dragon',name:'Armadura de Dragón',defense:7,icon:'🐲',value:300,rarity:'legendary',weight:4},
        {id:'plg_arm_shadow',name:'Armadura de Sombras',defense:3,icon:'🌑',value:100,rarity:'epic',weight:1}
    ];
    
    newArmors.forEach(function(a) { a.fromPlugin = true; Data.armors.push(a); });

    // ═══════════════════════════════════════════════════════════════
    // 12 MASCOTAS
    // ═══════════════════════════════════════════════════════════════
    
    var newPets = [
        {id:'plg_pet_cat',name:'Gato',health:12,damage:'1d4',speed:16,difficulty:18,icon:'🐱',regions:['pueblo','bosque']},
        {id:'plg_pet_dog',name:'Perro',health:18,damage:'1d6',speed:14,difficulty:16,icon:'🐕',regions:['pueblo','camino']},
        {id:'plg_pet_hawk',name:'Halcón',health:10,damage:'1d6',speed:20,difficulty:22,icon:'🦅',regions:['montana','desierto']},
        {id:'plg_pet_snake',name:'Serpiente',health:8,damage:'1d4',speed:12,difficulty:20,icon:'🐍',regions:['pantano','desierto']},
        {id:'plg_pet_spider',name:'Araña',health:15,damage:'1d6',speed:14,difficulty:24,icon:'🕷️',regions:['mazmorra','pantano']},
        {id:'plg_pet_bat',name:'Murciélago',health:8,damage:'1d4',speed:18,difficulty:16,icon:'🦇',regions:['mazmorra','bosque']},
        {id:'plg_pet_fox',name:'Zorro',health:14,damage:'1d4',speed:17,difficulty:20,icon:'🦊',regions:['bosque']},
        {id:'plg_pet_owl',name:'Búho',health:10,damage:'1d4',speed:15,difficulty:22,icon:'🦉',regions:['bosque','montana']},
        {id:'plg_pet_boar',name:'Jabalí',health:25,damage:'1d8',speed:11,difficulty:26,icon:'🐗',regions:['bosque']},
        {id:'plg_pet_turtle',name:'Tortuga',health:30,damage:'1d2',speed:6,difficulty:20,icon:'🐢',regions:['pantano']},
        {id:'plg_pet_raven',name:'Cuervo',health:8,damage:'1d4',speed:16,difficulty:18,icon:'🐦‍⬛',regions:['bosque','plg_cementerio']},
        {id:'plg_pet_phoenix',name:'Fénix Bebé',health:20,damage:'1d10',speed:18,difficulty:30,icon:'🔥',regions:['plg_volcan']}
    ];
    
    newPets.forEach(function(p) { p.fromPlugin = true; Data.pets.push(p); });

    // ═══════════════════════════════════════════════════════════════
    // 35 ENEMIGOS CON DROPS
    // ═══════════════════════════════════════════════════════════════
    
    var newEnemies = [
        // Tier 1 - Fáciles
        {id:'plg_rat',name:'Rata Gigante',health:8,damage:'1d4',difficulty:6,armor:0,speed:14,icon:'🐀',
            loot:[2,8],drops:[{itemId:'plg_rat_tail',chance:70},{itemId:'plg_cheese',chance:10}],
            regions:['mazmorra','pueblo'],canGroup:true,groupMin:3,groupMax:6,groupChance:60},
        {id:'plg_bat',name:'Murciélago',health:6,damage:'1d3',difficulty:7,armor:0,speed:16,icon:'🦇',
            loot:[3,8],drops:[{itemId:'plg_wing',chance:60},{itemId:'plg_bat_fang',chance:40}],
            regions:['mazmorra','plg_catacumbas'],canGroup:true,groupMin:3,groupMax:5,groupChance:70},
        {id:'plg_spider',name:'Araña Venenosa',health:10,damage:'1d4',difficulty:8,armor:0,speed:13,icon:'🕷️',effect:'poison',
            loot:[5,15],drops:[{itemId:'plg_silk',chance:60},{itemId:'plg_spider_leg',chance:40},{itemId:'plg_venom',chance:15}],
            regions:['bosque','mazmorra'],canGroup:true,groupMin:2,groupMax:4,groupChance:40},
        {id:'plg_slime',name:'Slime',health:15,damage:'1d4',difficulty:6,armor:0,speed:6,icon:'🟢',
            loot:[3,10],drops:[{itemId:'plg_slime',chance:80},{itemId:'plg_mucus',chance:50}],
            regions:['mazmorra','pantano'],canGroup:true,groupMin:2,groupMax:5,groupChance:50},
        {id:'plg_zombie',name:'Zombi',health:18,damage:'1d6',difficulty:8,armor:0,speed:6,icon:'🧟',
            loot:[8,20],drops:[{itemId:'plg_zombie_flesh',chance:70},{itemId:'plg_bone',chance:40}],
            regions:['plg_cementerio','plg_catacumbas'],canGroup:true,groupMin:2,groupMax:4,groupChance:50},
        {id:'plg_skeleton',name:'Esqueleto',health:12,damage:'1d6',difficulty:9,armor:1,speed:10,icon:'💀',
            loot:[10,20],drops:[{itemId:'plg_bone',chance:80},{itemId:'plg_skull',chance:20}],
            regions:['mazmorra','plg_catacumbas','plg_cementerio'],canGroup:true,groupMin:2,groupMax:3,groupChance:40},
        {id:'plg_imp',name:'Diablillo',health:10,damage:'1d6',difficulty:10,armor:0,speed:15,icon:'😈',effect:'fire',
            loot:[12,25],drops:[{itemId:'plg_ember',chance:30},{itemId:'plg_demon_horn',chance:5}],
            regions:['plg_torre','plg_volcan'],canGroup:true,groupMin:2,groupMax:3,groupChance:30},
            
        // Tier 2 - Medios
        {id:'plg_ghost',name:'Fantasma',health:20,damage:'1d6',difficulty:12,armor:0,speed:14,icon:'👻',
            loot:[15,30],drops:[{itemId:'plg_ectoplasm',chance:50},{itemId:'plg_shadow',chance:15}],
            regions:['plg_cementerio','plg_catacumbas'],canGroup:false},
        {id:'plg_ghoul',name:'Necrófago',health:25,damage:'1d8',difficulty:11,armor:1,speed:12,icon:'👹',effect:'poison',
            loot:[18,35],drops:[{itemId:'plg_claw',chance:40},{itemId:'plg_zombie_flesh',chance:60}],
            regions:['plg_cementerio','plg_catacumbas'],canGroup:true,groupMin:2,groupMax:3,groupChance:30},
        {id:'plg_banshee',name:'Banshee',health:22,damage:'1d8',difficulty:13,armor:0,speed:13,icon:'👻',
            loot:[20,40],drops:[{itemId:'plg_ectoplasm',chance:60},{itemId:'plg_shadow',chance:25}],
            regions:['plg_cementerio'],canGroup:false},
        {id:'plg_gargoyle',name:'Gárgola',health:30,damage:'1d8',difficulty:12,armor:4,speed:10,icon:'🗿',
            loot:[25,45],drops:[{itemId:'plg_iron',chance:40},{itemId:'plg_golem_core',chance:10}],
            regions:['plg_torre'],canGroup:true,groupMin:2,groupMax:2,groupChance:25},
        {id:'plg_golem',name:'Golem de Piedra',health:40,damage:'1d10',difficulty:13,armor:5,speed:6,icon:'🗿',
            loot:[30,50],drops:[{itemId:'plg_iron',chance:60},{itemId:'plg_golem_core',chance:25},{itemId:'plg_crystal',chance:10}],
            regions:['plg_torre','mazmorra'],canGroup:false},
        {id:'plg_werewolf',name:'Hombre Lobo',health:35,damage:'1d10',difficulty:14,armor:2,speed:15,icon:'🐺',effect:'bleed',
            loot:[25,50],drops:[{itemId:'plg_fur',chance:50},{itemId:'plg_fang',chance:40},{itemId:'plg_wolf_pelt',chance:30}],
            regions:['bosque'],canGroup:false},
        {id:'plg_harpy',name:'Arpía',health:22,damage:'1d8',difficulty:11,armor:0,speed:16,icon:'🦅',
            loot:[20,40],drops:[{itemId:'plg_feather',chance:50},{itemId:'plg_claw',chance:25}],
            regions:['montana'],canGroup:true,groupMin:2,groupMax:3,groupChance:35},
        {id:'plg_ogre',name:'Ogro',health:50,damage:'2d6',difficulty:13,armor:2,speed:7,icon:'👹',
            loot:[30,60],drops:[{itemId:'plg_claw',chance:30},{itemId:'plg_leather',chance:40},{itemId:'plg_wpn_club',chance:10}],
            regions:['montana','pantano'],canGroup:false},
        {id:'plg_minotaur',name:'Minotauro',health:45,damage:'2d8',difficulty:15,armor:3,speed:10,icon:'🐂',
            loot:[40,80],drops:[{itemId:'plg_horn',chance:40},{itemId:'plg_leather',chance:50},{itemId:'plg_wpn_axe',chance:5}],
            regions:['mazmorra'],canGroup:false},
        {id:'plg_crab',name:'Cangrejo Gigante',health:35,damage:'1d10',difficulty:12,armor:5,speed:8,icon:'🦀',
            loot:[20,45],drops:[{itemId:'plg_shell',chance:70},{itemId:'plg_fish',chance:30},{itemId:'plg_pearl',chance:10}],
            regions:['plg_abismo','pantano'],canGroup:false},
        {id:'plg_shark',name:'Tiburón',health:40,damage:'2d6',difficulty:13,armor:1,speed:14,icon:'🦈',
            loot:[25,50],drops:[{itemId:'plg_tooth',chance:60},{itemId:'plg_fish',chance:40}],
            regions:['plg_abismo'],canGroup:false},
        {id:'plg_mermaid',name:'Sirena Oscura',health:28,damage:'1d8',difficulty:12,armor:0,speed:13,icon:'🧜',
            loot:[30,55],drops:[{itemId:'plg_mermaid_scale',chance:40},{itemId:'plg_pearl',chance:25}],
            regions:['plg_abismo'],canGroup:false},
        {id:'plg_salamander',name:'Salamandra de Fuego',health:30,damage:'1d10',difficulty:12,armor:1,speed:12,icon:'🦎',effect:'fire',
            loot:[25,45],drops:[{itemId:'plg_ember',chance:50},{itemId:'plg_scale',chance:20}],
            regions:['plg_volcan'],canGroup:true,groupMin:2,groupMax:2,groupChance:30},
            
        // Tier 3 - Difíciles
        {id:'plg_vampire',name:'Vampiro',health:40,damage:'1d8',difficulty:14,armor:1,speed:14,icon:'🧛',
            loot:[35,70],drops:[{itemId:'plg_fang',chance:50},{itemId:'plg_shadow',chance:30},{itemId:'plg_book_spell',chance:5}],
            regions:['plg_catacumbas'],canGroup:false},
        {id:'plg_necromancer',name:'Nigromante',health:25,damage:'1d8',difficulty:14,armor:0,speed:10,icon:'🧙‍♂️',usesMana:true,
            loot:[30,60],drops:[{itemId:'plg_book_spell',chance:20},{itemId:'plg_shadow',chance:40},{itemId:'plg_skull',chance:30}],
            regions:['plg_catacumbas','plg_cementerio'],canGroup:false},
        {id:'plg_wizard',name:'Mago Oscuro',health:30,damage:'2d6',difficulty:14,armor:0,speed:11,icon:'🧙',usesMana:true,
            loot:[35,65],drops:[{itemId:'plg_book_spell',chance:25},{itemId:'plg_crystal',chance:30},{itemId:'plg_herb_rare',chance:20}],
            regions:['plg_torre'],canGroup:false},
        {id:'plg_ice_elem',name:'Elemental de Hielo',health:30,damage:'1d8',difficulty:13,armor:2,speed:10,icon:'❄️',effect:'ice',
            loot:[25,50],drops:[{itemId:'plg_frost',chance:60},{itemId:'plg_crystal',chance:20},{itemId:'plg_sapphire',chance:5}],
            regions:['montana'],canGroup:false},
        {id:'plg_fire_elem',name:'Elemental de Fuego',health:30,damage:'1d10',difficulty:13,armor:1,speed:12,icon:'🔥',effect:'fire',
            loot:[25,50],drops:[{itemId:'plg_ember',chance:60},{itemId:'plg_crystal',chance:20},{itemId:'plg_ruby',chance:5}],
            regions:['plg_volcan','desierto'],canGroup:false},
        {id:'plg_elemental',name:'Elemental Arcano',health:35,damage:'1d10',difficulty:14,armor:2,speed:11,icon:'✨',
            loot:[30,55],drops:[{itemId:'plg_crystal',chance:50},{itemId:'plg_mithril',chance:15}],
            regions:['plg_torre'],canGroup:false},
        {id:'plg_lava_golem',name:'Golem de Lava',health:50,damage:'2d6',difficulty:15,armor:4,speed:6,icon:'🌋',effect:'fire',
            loot:[40,70],drops:[{itemId:'plg_ember',chance:70},{itemId:'plg_golem_core',chance:30},{itemId:'plg_ruby',chance:10}],
            regions:['plg_volcan'],canGroup:false},
        {id:'plg_sea_serpent',name:'Serpiente Marina',health:55,damage:'2d8',difficulty:15,armor:3,speed:12,icon:'🐉',
            loot:[45,80],drops:[{itemId:'plg_scale',chance:50},{itemId:'plg_pearl',chance:30},{itemId:'plg_mermaid_scale',chance:20}],
            regions:['plg_abismo'],canGroup:false},
        {id:'plg_kraken_tentacle',name:'Tentáculo de Kraken',health:40,damage:'1d12',difficulty:14,armor:2,speed:10,icon:'🦑',
            loot:[35,65],drops:[{itemId:'plg_kraken_ink',chance:50},{itemId:'plg_shell',chance:30}],
            regions:['plg_abismo'],canGroup:true,groupMin:2,groupMax:4,groupChance:40},
            
        // Tier 4 - Jefes
        {id:'plg_dragon_young',name:'Dragón Joven',health:60,damage:'2d8',difficulty:16,armor:4,speed:12,icon:'🐲',effect:'fire',
            loot:[60,120],drops:[{itemId:'plg_scale',chance:60},{itemId:'plg_ruby',chance:15},{itemId:'plg_heart',chance:20}],
            regions:['montana','plg_volcan'],canGroup:false},
        {id:'plg_phoenix',name:'Fénix',health:50,damage:'2d10',difficulty:17,armor:2,speed:16,icon:'🔥',effect:'fire',
            loot:[70,130],drops:[{itemId:'plg_phoenix_ash',chance:40},{itemId:'plg_feather',chance:60},{itemId:'plg_ember',chance:50}],
            regions:['plg_volcan'],canGroup:false},
        {id:'plg_lich',name:'Lich',health:55,damage:'2d8',difficulty:17,armor:2,speed:10,icon:'💀',usesMana:true,
            loot:[65,120],drops:[{itemId:'plg_skull',chance:70},{itemId:'plg_shadow',chance:50},{itemId:'plg_book_spell',chance:30},{itemId:'plg_diamond',chance:5}],
            regions:['plg_catacumbas'],canGroup:false},
        {id:'plg_demon',name:'Demonio Mayor',health:70,damage:'2d10',difficulty:18,armor:3,speed:12,icon:'👿',effect:'fire',
            loot:[80,150],drops:[{itemId:'plg_demon_horn',chance:50},{itemId:'plg_shadow',chance:40},{itemId:'plg_ember',chance:60}],
            regions:['plg_volcan','plg_catacumbas'],canGroup:false},
        {id:'plg_dragon_elder',name:'Dragón Anciano',health:100,damage:'3d8',difficulty:20,armor:6,speed:10,icon:'🐉',effect:'fire',
            loot:[150,300],drops:[{itemId:'plg_scale',chance:80},{itemId:'plg_dragon_blood',chance:50},{itemId:'plg_diamond',chance:20},{itemId:'plg_heart',chance:40}],
            regions:['plg_volcan'],canGroup:false}
    ];
    
    newEnemies.forEach(function(e) { e.fromPlugin = true; Data.enemies.push(e); });

    // ═══════════════════════════════════════════════════════════════
    // HECHIZOS NUEVOS
    // ═══════════════════════════════════════════════════════════════
    
    var newSpells = [
        {id:'plg_sp_ice',name:'Rayo de Hielo',damage:'1d8',cost:4,icon:'❄️',effect:'ice',desc:'30% de congelar.'},
        {id:'plg_sp_lightning',name:'Relámpago',damage:'2d6',cost:5,icon:'⚡',desc:'Daño eléctrico.'},
        {id:'plg_sp_meteor',name:'Meteoro',damage:'3d6',cost:10,icon:'☄️',effect:'fire',desc:'Destrucción masiva.'},
        {id:'plg_sp_drain',name:'Drenar Vida',damage:'1d6',cost:4,icon:'💜',desc:'Roba HP.'},
        {id:'plg_sp_blizzard',name:'Ventisca',damage:'2d4',cost:6,icon:'🌨️',effect:'ice',desc:'Hielo en área.'},
        {id:'plg_sp_inferno',name:'Infierno',damage:'2d8',cost:8,icon:'🔥',effect:'fire',desc:'Fuego devastador.'},
        {id:'plg_sp_heal',name:'Curación Mayor',damage:'0',cost:6,icon:'💚',effect:'heal',healAmount:'3d6',desc:'Cura 3d6 HP.'}
    ];
    
    if (!Data.spells) Data.spells = [];
    newSpells.forEach(function(s) { s.fromPlugin = true; Data.spells.push(s); });

    // ═══════════════════════════════════════════════════════════════
    // RESUMEN
    // ═══════════════════════════════════════════════════════════════
    
    console.log('📦 Plugin data cargada:');
    console.log('   Regiones: +' + newRegions.length);
    console.log('   Items: +' + newItems.length);
    console.log('   Accesorios: +' + newAccessories.length);
    console.log('   Armas: +' + newWeapons.length);
    console.log('   Armaduras: +' + newArmors.length);
    console.log('   Mascotas: +' + newPets.length);
    console.log('   Enemigos: +' + newEnemies.length);
    console.log('   Hechizos: +' + newSpells.length);
    
    // Actualizar Editor
    if (typeof Editor !== 'undefined' && Editor.renderAll) {
        setTimeout(function() {
            Editor.renderAll();
            Editor.updateSelects();
            console.log('📝 Editor actualizado');
        }, 100);
    }
}

// ═══════════════════════════════════════════════════════════════════
// PLUGINS DE SISTEMA
// ═══════════════════════════════════════════════════════════════════

// Sistema de Combo
Plugins.register({
    id: 'combo_system',
    name: 'Sistema de Combo',
    comboCount: 0,
    onCombatStart: function() { this.comboCount = 0; },
    onAttack: function(attacker, target, damage, hit) {
        if (typeof G === 'undefined' || !G.p || attacker !== G.p) return damage;
        if (hit) {
            this.comboCount++;
            if (this.comboCount >= 3) {
                var bonus = Math.floor(damage * 0.1 * (this.comboCount - 2));
                if (bonus > 0 && typeof Combat !== 'undefined') {
                    Combat.log('<span class="log-crit">🔥 Combo x' + this.comboCount + ' (+' + bonus + ')</span>');
                }
                return damage + bonus;
            }
        } else {
            this.comboCount = 0;
        }
        return damage;
    },
    onCombatEnd: function() { this.comboCount = 0; }
});

// Sistema de efectos de accesorios
Plugins.register({
    id: 'accessory_effects',
    name: 'Efectos de Accesorios',
    
    getAccessoryBonuses: function(player) {
        var bonuses = {speed:0,crit:0,evasion:0,armor:0,damage:0,mana:0,gold:0,xp:0,luck:0};
        if (!player || !player.inv) return bonuses;
        
        player.inv.forEach(function(item) {
            if (item.id && item.id.toString().startsWith('plg_acc_')) {
                var special = Plugins.specialItems[item.id];
                if (special) {
                    if (special.speedBonus) bonuses.speed += special.speedBonus;
                    if (special.critBonus) bonuses.crit += special.critBonus;
                    if (special.evasionBonus) bonuses.evasion += special.evasionBonus;
                    if (special.armorBonus) bonuses.armor += special.armorBonus;
                    if (special.damageBonus) bonuses.damage += special.damageBonus;
                    if (special.manaBonus) bonuses.mana += special.manaBonus;
                }
            }
        });
        return bonuses;
    }
});

// Cargar al inicio
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPluginItems);
} else {
    loadPluginItems();
}

console.log('🎮 RPG Plugins v15 cargado');
