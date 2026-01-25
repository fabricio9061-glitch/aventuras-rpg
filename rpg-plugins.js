/**
 * RPG Plugins v18 - Complete Crafting System
 * Todos los items necesarios para crafteo incluidos
 */

var Plugins = {
    registry: [],
    specialItems: {},
    customEffects: {},
    register: function(p) { if(p.id) this.registry.push(p); },
    trigger: function(h) {
        var a = Array.prototype.slice.call(arguments, 1), r = null;
        this.registry.forEach(function(p) { if(typeof p[h]==='function') { var x=p[h].apply(p,a); if(x!==undefined)r=x; } });
        return r;
    },
    isPluginId: function(id) { return id && id.toString().startsWith('plg_'); },
    getSpecialItem: function(id) { return this.specialItems[id] || null; },
    processEquippedEffects: function(entity, hook) {
        // Procesar efectos de items equipados
        if(!entity) return;
        var self = this;
        ['weapon','armor','accessory'].forEach(function(slot) {
            var item = entity[slot];
            if(item && self.specialItems[item.id]) {
                var special = self.specialItems[item.id];
                if(typeof special[hook] === 'function') {
                    special[hook](entity, item);
                }
            }
        });
    }
};

function loadPluginItems() {
    if (typeof Data === 'undefined') { setTimeout(loadPluginItems, 100); return; }
    
    console.log('🔌 Cargando plugin v18...');
    
    ['regions','enemies','pets','weapons','armors','items','spells','recipes'].forEach(function(k) {
        if (Data[k]) Data[k] = Data[k].filter(function(x) { return !x.id || !x.id.toString().startsWith('plg_'); });
    });

    // ═══════════════════════════════════════════════════════════════
    // REGIONES (5)
    // ═══════════════════════════════════════════════════════════════
    var regions = [
        {id:'plg_catacumbas',name:'Catacumbas',icon:'💀',type:'danger',danger:4,distance:7,desc:'Tumbas antiguas.',connections:['mazmorra']},
        {id:'plg_volcan',name:'Volcán',icon:'🌋',type:'danger',danger:5,distance:10,desc:'Calor mortal.',connections:['montana']},
        {id:'plg_abismo',name:'Abismo Marino',icon:'🌊',type:'danger',danger:4,distance:8,desc:'Profundidades.',connections:['pantano']},
        {id:'plg_torre',name:'Torre del Mago',icon:'🏰',type:'danger',danger:3,distance:5,desc:'Magia peligrosa.',connections:['pueblo','bosque']},
        {id:'plg_cementerio',name:'Cementerio',icon:'🪦',type:'danger',danger:3,distance:4,desc:'No-muertos.',connections:['pueblo','bosque']}
    ];
    regions.forEach(function(r) { r.fromPlugin = true; Data.regions.push(r); });

    // ═══════════════════════════════════════════════════════════════
    // MATERIALES DE CRAFTEO (100+)
    // ═══════════════════════════════════════════════════════════════
    var materials = [
        // Metales
        {id:'plg_iron',name:'Hierro',type:'misc',icon:'🪨',value:15,rarity:'common',desc:'Metal común.'},
        {id:'plg_steel',name:'Acero',type:'misc',icon:'⬜',value:30,rarity:'rare',desc:'Hierro refinado.'},
        {id:'plg_silver',name:'Plata',type:'misc',icon:'🥈',value:40,rarity:'rare',desc:'Metal precioso.'},
        {id:'plg_gold',name:'Oro',type:'misc',icon:'🥇',value:60,rarity:'rare',desc:'Metal noble.'},
        {id:'plg_mithril',name:'Mithril',type:'misc',icon:'✨',value:100,rarity:'epic',desc:'Metal élfico.'},
        {id:'plg_adamantine',name:'Adamantina',type:'misc',icon:'💎',value:150,rarity:'legendary',desc:'Indestructible.'},
        {id:'plg_copper',name:'Cobre',type:'misc',icon:'🟤',value:8,rarity:'common',desc:'Metal blando.'},
        {id:'plg_tin',name:'Estaño',type:'misc',icon:'⬜',value:10,rarity:'common',desc:'Para aleaciones.'},
        {id:'plg_bronze',name:'Bronce',type:'misc',icon:'🟫',value:20,rarity:'common',desc:'Aleación antigua.'},
        // Materiales básicos
        {id:'plg_wood',name:'Madera',type:'misc',icon:'🪵',value:5,rarity:'common',desc:'De árbol.'},
        {id:'plg_hardwood',name:'Madera Dura',type:'misc',icon:'🪵',value:15,rarity:'rare',desc:'Roble o ébano.'},
        {id:'plg_coal',name:'Carbón',type:'misc',icon:'⬛',value:8,rarity:'common',desc:'Combustible.'},
        {id:'plg_leather',name:'Cuero',type:'misc',icon:'🟫',value:12,rarity:'common',desc:'Piel curtida.'},
        {id:'plg_thick_leather',name:'Cuero Grueso',type:'misc',icon:'🟫',value:25,rarity:'rare',desc:'Extra resistente.'},
        {id:'plg_cloth',name:'Tela',type:'misc',icon:'🧵',value:8,rarity:'common',desc:'Para ropa.'},
        {id:'plg_silk',name:'Seda',type:'misc',icon:'🕸️',value:20,rarity:'rare',desc:'De araña o gusano.'},
        {id:'plg_thread',name:'Hilo',type:'misc',icon:'🪡',value:5,rarity:'common',desc:'Para coser.'},
        {id:'plg_rope',name:'Cuerda',type:'misc',icon:'🪢',value:10,rarity:'common',desc:'Resistente.'},
        // Gemas
        {id:'plg_ruby',name:'Rubí',type:'misc',icon:'🔴',value:80,rarity:'epic',desc:'Gema de fuego.'},
        {id:'plg_sapphire',name:'Zafiro',type:'misc',icon:'🔵',value:80,rarity:'epic',desc:'Gema de hielo.'},
        {id:'plg_emerald',name:'Esmeralda',type:'misc',icon:'🟢',value:80,rarity:'epic',desc:'Gema de vida.'},
        {id:'plg_diamond',name:'Diamante',type:'misc',icon:'💠',value:150,rarity:'legendary',desc:'Gema perfecta.'},
        {id:'plg_amethyst',name:'Amatista',type:'misc',icon:'🟣',value:50,rarity:'rare',desc:'Gema arcana.'},
        {id:'plg_topaz',name:'Topacio',type:'misc',icon:'🟡',value:50,rarity:'rare',desc:'Gema del rayo.'},
        {id:'plg_opal',name:'Ópalo',type:'misc',icon:'⚪',value:60,rarity:'epic',desc:'Multicolor.'},
        {id:'plg_onyx',name:'Ónix',type:'misc',icon:'⚫',value:60,rarity:'epic',desc:'Gema oscura.'},
        {id:'plg_crystal',name:'Cristal Mágico',type:'misc',icon:'💎',value:45,rarity:'rare',desc:'Arcano.'},
        // Partes de monstruos
        {id:'plg_bone',name:'Hueso',type:'misc',icon:'🦴',value:5,rarity:'common',desc:'De criatura.'},
        {id:'plg_fang',name:'Colmillo',type:'misc',icon:'🦷',value:12,rarity:'common',desc:'Afilado.'},
        {id:'plg_claw',name:'Garra',type:'misc',icon:'🦎',value:15,rarity:'common',desc:'De bestia.'},
        {id:'plg_horn',name:'Cuerno',type:'misc',icon:'🐂',value:25,rarity:'rare',desc:'Macizo.'},
        {id:'plg_scale',name:'Escama',type:'misc',icon:'🐉',value:30,rarity:'rare',desc:'De reptil.'},
        {id:'plg_dragon_scale',name:'Escama Dragón',type:'misc',icon:'🐲',value:80,rarity:'epic',desc:'Legendaria.'},
        {id:'plg_fur',name:'Piel',type:'misc',icon:'🧸',value:15,rarity:'common',desc:'Pelaje.'},
        {id:'plg_feather',name:'Pluma',type:'misc',icon:'🪶',value:10,rarity:'common',desc:'De ave.'},
        {id:'plg_wing',name:'Ala Murciélago',type:'misc',icon:'🦇',value:12,rarity:'common',desc:'Membrana.'},
        {id:'plg_eye',name:'Ojo Mágico',type:'misc',icon:'👁️',value:40,rarity:'rare',desc:'Con poder.'},
        {id:'plg_heart',name:'Corazón',type:'misc',icon:'❤️',value:35,rarity:'rare',desc:'De bestia.'},
        {id:'plg_venom',name:'Veneno',type:'misc',icon:'🐍',value:20,rarity:'rare',desc:'Tóxico.'},
        {id:'plg_slime',name:'Gelatina',type:'misc',icon:'🟢',value:6,rarity:'common',desc:'Viscosa.'},
        {id:'plg_ectoplasm',name:'Ectoplasma',type:'misc',icon:'👻',value:30,rarity:'rare',desc:'Fantasmal.'},
        {id:'plg_shadow',name:'Esencia Sombra',type:'misc',icon:'🌑',value:50,rarity:'epic',desc:'Oscura.'},
        {id:'plg_ember',name:'Brasa Elemental',type:'misc',icon:'🔥',value:40,rarity:'rare',desc:'Fuego eterno.'},
        {id:'plg_frost',name:'Esencia Hielo',type:'misc',icon:'❄️',value:40,rarity:'rare',desc:'Frío eterno.'},
        {id:'plg_spark',name:'Chispa Tormenta',type:'misc',icon:'⚡',value:40,rarity:'rare',desc:'Electricidad.'},
        // Partes específicas
        {id:'plg_wolf_pelt',name:'Piel Lobo',type:'misc',icon:'🐺',value:18,rarity:'common'},
        {id:'plg_bear_pelt',name:'Piel Oso',type:'misc',icon:'🐻',value:30,rarity:'rare'},
        {id:'plg_rat_tail',name:'Cola Rata',type:'misc',icon:'🐀',value:3,rarity:'common'},
        {id:'plg_spider_silk',name:'Seda Araña',type:'misc',icon:'🕷️',value:15,rarity:'common'},
        {id:'plg_bat_wing',name:'Ala Murciélago',type:'misc',icon:'🦇',value:10,rarity:'common'},
        {id:'plg_goblin_ear',name:'Oreja Goblin',type:'misc',icon:'👂',value:7,rarity:'common'},
        {id:'plg_troll_blood',name:'Sangre Troll',type:'misc',icon:'🩸',value:35,rarity:'rare',desc:'Regenerativa.'},
        {id:'plg_dragon_blood',name:'Sangre Dragón',type:'misc',icon:'🩸',value:100,rarity:'legendary'},
        {id:'plg_phoenix_ash',name:'Ceniza Fénix',type:'misc',icon:'🔥',value:120,rarity:'legendary'},
        {id:'plg_unicorn_horn',name:'Cuerno Unicornio',type:'misc',icon:'🦄',value:150,rarity:'legendary'},
        {id:'plg_demon_horn',name:'Cuerno Demonio',type:'misc',icon:'😈',value:70,rarity:'epic'},
        {id:'plg_angel_feather',name:'Pluma Ángel',type:'misc',icon:'🪽',value:100,rarity:'legendary'},
        {id:'plg_kraken_ink',name:'Tinta Kraken',type:'misc',icon:'🦑',value:55,rarity:'epic'},
        {id:'plg_mermaid_scale',name:'Escama Sirena',type:'misc',icon:'🧜',value:65,rarity:'epic'},
        {id:'plg_golem_core',name:'Núcleo Golem',type:'misc',icon:'🤖',value:60,rarity:'epic'},
        {id:'plg_skull',name:'Cráneo',type:'misc',icon:'💀',value:15,rarity:'common'},
        {id:'plg_zombie_flesh',name:'Carne Zombi',type:'misc',icon:'🧟',value:5,rarity:'common'},
        {id:'plg_werewolf_claw',name:'Garra Licántropo',type:'misc',icon:'🐺',value:40,rarity:'rare'},
        {id:'plg_vampire_fang',name:'Colmillo Vampiro',type:'misc',icon:'🧛',value:50,rarity:'epic'},
        {id:'plg_basilisk_eye',name:'Ojo Basilisco',type:'misc',icon:'👁️',value:70,rarity:'epic'},
        {id:'plg_hydra_fang',name:'Colmillo Hidra',type:'misc',icon:'🐍',value:80,rarity:'legendary'},
        {id:'plg_manticore_spike',name:'Púa Mantícora',type:'misc',icon:'🦂',value:45,rarity:'rare'},
        {id:'plg_chimera_mane',name:'Melena Quimera',type:'misc',icon:'🦁',value:65,rarity:'epic'},
        {id:'plg_pearl',name:'Perla',type:'misc',icon:'🫧',value:40,rarity:'rare'},
        {id:'plg_shell',name:'Caparazón',type:'misc',icon:'🐚',value:12,rarity:'common'},
        {id:'plg_tooth',name:'Diente Tiburón',type:'misc',icon:'🦈',value:18,rarity:'common'},
        // Hierbas y plantas
        {id:'plg_herb_heal',name:'Hierba Curativa',type:'misc',icon:'🌿',value:10,rarity:'common'},
        {id:'plg_herb_mana',name:'Flor Maná',type:'misc',icon:'🌸',value:15,rarity:'common'},
        {id:'plg_herb_poison',name:'Belladona',type:'misc',icon:'🍇',value:12,rarity:'common'},
        {id:'plg_herb_rare',name:'Raíz Arcana',type:'misc',icon:'🌱',value:40,rarity:'rare'},
        {id:'plg_mushroom_red',name:'Hongo Rojo',type:'misc',icon:'🍄',value:8,rarity:'common'},
        {id:'plg_mushroom_blue',name:'Hongo Azul',type:'misc',icon:'🍄',value:25,rarity:'rare'},
        {id:'plg_lotus',name:'Loto Negro',type:'misc',icon:'🪷',value:50,rarity:'epic'},
        {id:'plg_mandrake',name:'Mandrágora',type:'misc',icon:'🥕',value:45,rarity:'rare'},
        // Objetos de crafteo
        {id:'plg_scroll_blank',name:'Pergamino Blanco',type:'misc',icon:'📜',value:10,rarity:'common'},
        {id:'plg_book_empty',name:'Libro Vacío',type:'misc',icon:'📕',value:20,rarity:'common'},
        {id:'plg_flask_empty',name:'Frasco Vacío',type:'misc',icon:'🧴',value:5,rarity:'common'},
        {id:'plg_vial',name:'Vial',type:'misc',icon:'🧪',value:8,rarity:'common'},
        {id:'plg_chain',name:'Cadena',type:'misc',icon:'⛓️',value:15,rarity:'common'},
        {id:'plg_ring_base',name:'Aro Base',type:'misc',icon:'⭕',value:10,rarity:'common'},
        {id:'plg_amulet_base',name:'Amuleto Base',type:'misc',icon:'📿',value:15,rarity:'common'},
        {id:'plg_enchant_dust',name:'Polvo Encantamiento',type:'misc',icon:'✨',value:30,rarity:'rare'},
        {id:'plg_magic_essence',name:'Esencia Mágica',type:'misc',icon:'💫',value:50,rarity:'epic'},
        {id:'plg_soul_gem',name:'Gema del Alma',type:'misc',icon:'💜',value:80,rarity:'epic'},
        // === 50 ITEMS COMUNES DROPEABLES ===
        // Monedas y tesoros
        {id:'plg_coin_copper',name:'Moneda Cobre',type:'misc',icon:'🪙',value:1,rarity:'common'},
        {id:'plg_coin_silver',name:'Moneda Plata',type:'misc',icon:'🥈',value:5,rarity:'common'},
        {id:'plg_coin_gold',name:'Moneda Oro',type:'misc',icon:'🥇',value:10,rarity:'common'},
        {id:'plg_coin_ancient',name:'Moneda Antigua',type:'misc',icon:'🏛️',value:25,rarity:'rare'},
        {id:'plg_gem_rough',name:'Gema Bruta',type:'misc',icon:'💎',value:15,rarity:'common'},
        {id:'plg_jewel_small',name:'Joya Pequeña',type:'misc',icon:'💍',value:20,rarity:'common'},
        {id:'plg_nugget_gold',name:'Pepita Oro',type:'misc',icon:'✨',value:30,rarity:'rare'},
        {id:'plg_treasure_small',name:'Tesoro Pequeño',type:'misc',icon:'💰',value:40,rarity:'rare'},
        // Objetos encontrados
        {id:'plg_key_rusty',name:'Llave Oxidada',type:'misc',icon:'🗝️',value:5,rarity:'common'},
        {id:'plg_key_brass',name:'Llave Latón',type:'misc',icon:'🔑',value:12,rarity:'common'},
        {id:'plg_key_silver',name:'Llave Plata',type:'misc',icon:'🗝️',value:25,rarity:'rare'},
        {id:'plg_key_gold',name:'Llave Dorada',type:'misc',icon:'🔑',value:50,rarity:'epic'},
        {id:'plg_lockpick',name:'Ganzúa',type:'misc',icon:'🔧',value:8,rarity:'common'},
        {id:'plg_torch',name:'Antorcha',type:'misc',icon:'🔦',value:3,rarity:'common'},
        {id:'plg_candle',name:'Vela',type:'misc',icon:'🕯️',value:2,rarity:'common'},
        {id:'plg_lantern',name:'Linterna',type:'misc',icon:'🏮',value:15,rarity:'common'},
        {id:'plg_rope_short',name:'Cuerda Corta',type:'misc',icon:'🪢',value:5,rarity:'common'},
        {id:'plg_bandage',name:'Vendaje',type:'misc',icon:'🩹',value:8,rarity:'common'},
        {id:'plg_ration',name:'Ración',type:'misc',icon:'🍱',value:10,rarity:'common'},
        {id:'plg_waterskin',name:'Odre Agua',type:'misc',icon:'💧',value:6,rarity:'common'},
        // Materiales de monstruos comunes
        {id:'plg_rat_fur',name:'Pelo Rata',type:'misc',icon:'🐀',value:2,rarity:'common'},
        {id:'plg_spider_leg',name:'Pata Araña',type:'misc',icon:'🕷️',value:4,rarity:'common'},
        {id:'plg_bat_ear',name:'Oreja Murciélago',type:'misc',icon:'🦇',value:3,rarity:'common'},
        {id:'plg_wolf_tooth',name:'Diente Lobo',type:'misc',icon:'🦷',value:8,rarity:'common'},
        {id:'plg_goblin_nose',name:'Nariz Goblin',type:'misc',icon:'👃',value:5,rarity:'common'},
        {id:'plg_skeleton_finger',name:'Dedo Esqueleto',type:'misc',icon:'🦴',value:6,rarity:'common'},
        {id:'plg_zombie_eye',name:'Ojo Zombi',type:'misc',icon:'👁️',value:7,rarity:'common'},
        {id:'plg_slime_core',name:'Núcleo Slime',type:'misc',icon:'🟢',value:10,rarity:'common'},
        {id:'plg_imp_tail',name:'Cola Diablillo',type:'misc',icon:'😈',value:12,rarity:'common'},
        {id:'plg_kobold_scale',name:'Escama Kobold',type:'misc',icon:'🦎',value:6,rarity:'common'},
        // Objetos mágicos menores
        {id:'plg_rune_stone',name:'Piedra Rúnica',type:'misc',icon:'🪨',value:15,rarity:'common'},
        {id:'plg_mana_shard',name:'Fragmento Maná',type:'misc',icon:'💠',value:12,rarity:'common'},
        {id:'plg_arcane_dust',name:'Polvo Arcano',type:'misc',icon:'✨',value:8,rarity:'common'},
        {id:'plg_magic_ink',name:'Tinta Mágica',type:'misc',icon:'🖋️',value:10,rarity:'common'},
        {id:'plg_spirit_wisp',name:'Luz Espíritu',type:'misc',icon:'👻',value:18,rarity:'common'},
        {id:'plg_elemental_shard',name:'Fragmento Elemental',type:'misc',icon:'🌀',value:20,rarity:'rare'},
        // Objetos de exploración
        {id:'plg_map_piece',name:'Trozo Mapa',type:'misc',icon:'🗺️',value:15,rarity:'common'},
        {id:'plg_compass_broken',name:'Brújula Rota',type:'misc',icon:'🧭',value:8,rarity:'common'},
        {id:'plg_old_letter',name:'Carta Vieja',type:'misc',icon:'✉️',value:5,rarity:'common'},
        {id:'plg_torn_page',name:'Página Rasgada',type:'misc',icon:'📄',value:6,rarity:'common'},
        {id:'plg_ancient_coin',name:'Reliquia Antigua',type:'misc',icon:'🏺',value:35,rarity:'rare'},
        {id:'plg_idol_small',name:'Ídolo Pequeño',type:'misc',icon:'🗿',value:25,rarity:'rare'},
        {id:'plg_lucky_charm',name:'Amuleto Suerte',type:'misc',icon:'🍀',value:20,rarity:'common'},
        {id:'plg_bone_dice',name:'Dados Hueso',type:'misc',icon:'🎲',value:10,rarity:'common'},
        {id:'plg_old_ring',name:'Anillo Viejo',type:'misc',icon:'💍',value:12,rarity:'common'},
        {id:'plg_broken_amulet',name:'Amuleto Roto',type:'misc',icon:'📿',value:8,rarity:'common'},
        {id:'plg_mysterious_orb',name:'Orbe Misterioso',type:'misc',icon:'🔮',value:30,rarity:'rare'},
        {id:'plg_strange_egg',name:'Huevo Extraño',type:'misc',icon:'🥚',value:25,rarity:'rare'}
    ];
    materials.forEach(function(m) { m.fromPlugin = true; Data.items.push(m); });

    // ═══════════════════════════════════════════════════════════════
    // POCIONES (15)
    // ═══════════════════════════════════════════════════════════════
    var potions = [
        {id:'plg_pot_hp_minor',name:'Poción HP Menor',type:'potion',icon:'🧪',value:15,rarity:'common',potionType:'health',effect:'1d8'},
        {id:'plg_pot_hp',name:'Poción HP',type:'potion',icon:'🧪',value:30,rarity:'common',potionType:'health',effect:'2d8'},
        {id:'plg_pot_hp_major',name:'Poción HP Mayor',type:'potion',icon:'🧪',value:60,rarity:'rare',potionType:'health',effect:'4d8'},
        {id:'plg_pot_mana_minor',name:'Poción Maná Menor',type:'potion',icon:'🧪',value:15,rarity:'common',potionType:'mana',effect:'1d8'},
        {id:'plg_pot_mana',name:'Poción Maná',type:'potion',icon:'🧪',value:30,rarity:'common',potionType:'mana',effect:'2d8'},
        {id:'plg_pot_mana_major',name:'Poción Maná Mayor',type:'potion',icon:'🧪',value:60,rarity:'rare',potionType:'mana',effect:'4d8'},
        {id:'plg_pot_strength',name:'Poción Fuerza',type:'potion',icon:'💪',value:40,rarity:'rare',potionType:'buff',effect:'+3 daño'},
        {id:'plg_pot_speed',name:'Poción Velocidad',type:'potion',icon:'💨',value:40,rarity:'rare',potionType:'buff',effect:'+5 vel'},
        {id:'plg_pot_armor',name:'Poción Piedra',type:'potion',icon:'🗿',value:40,rarity:'rare',potionType:'buff',effect:'+5 arm'},
        {id:'plg_pot_fire_res',name:'Resist. Fuego',type:'potion',icon:'🔥',value:35,rarity:'rare',potionType:'buff',effect:'Inmune fuego'},
        {id:'plg_pot_ice_res',name:'Resist. Hielo',type:'potion',icon:'❄️',value:35,rarity:'rare',potionType:'buff',effect:'Inmune hielo'},
        {id:'plg_pot_invis',name:'Poción Invisibilidad',type:'potion',icon:'👻',value:50,rarity:'epic',potionType:'buff',effect:'Invisible'},
        {id:'plg_pot_regen',name:'Poción Regeneración',type:'potion',icon:'💚',value:55,rarity:'epic',potionType:'buff',effect:'+3 HP/turno'},
        {id:'plg_elixir',name:'Elixir Vida',type:'potion',icon:'⭐',value:100,rarity:'legendary',potionType:'health',effect:'Full HP'},
        {id:'plg_antidote',name:'Antídoto',type:'antidote',icon:'💊',value:20,rarity:'common',cures:'poison'}
    ];
    potions.forEach(function(p) { p.fromPlugin = true; Data.items.push(p); });

    // ═══════════════════════════════════════════════════════════════
    // COMIDAS (50)
    // ═══════════════════════════════════════════════════════════════
    var foods = [
        {id:'plg_food_bread',name:'Pan',type:'food',icon:'🍞',value:5,rarity:'common',foodValue:3},
        {id:'plg_food_cheese',name:'Queso',type:'food',icon:'🧀',value:8,rarity:'common',foodValue:4},
        {id:'plg_food_apple',name:'Manzana',type:'food',icon:'🍎',value:3,rarity:'common',foodValue:2},
        {id:'plg_food_fish',name:'Pescado',type:'food',icon:'🐟',value:10,rarity:'common',foodValue:5},
        {id:'plg_food_meat',name:'Carne',type:'food',icon:'🍖',value:12,rarity:'common',foodValue:6},
        {id:'plg_food_chicken',name:'Pollo',type:'food',icon:'🍗',value:14,rarity:'common',foodValue:6},
        {id:'plg_food_stew',name:'Estofado',type:'food',icon:'🍲',value:25,rarity:'rare',foodValue:8},
        {id:'plg_food_pie',name:'Pastel',type:'food',icon:'🥧',value:18,rarity:'rare',foodValue:7},
        {id:'plg_food_soup',name:'Sopa',type:'food',icon:'🍜',value:8,rarity:'common',foodValue:4},
        {id:'plg_food_egg',name:'Huevos',type:'food',icon:'🍳',value:6,rarity:'common',foodValue:3},
        {id:'plg_food_honey',name:'Miel',type:'food',icon:'🍯',value:15,rarity:'rare',foodValue:5},
        {id:'plg_food_wine',name:'Vino',type:'food',icon:'🍷',value:20,rarity:'rare',foodValue:4},
        {id:'plg_food_ale',name:'Cerveza',type:'food',icon:'🍺',value:10,rarity:'common',foodValue:3},
        {id:'plg_food_grapes',name:'Uvas',type:'food',icon:'🍇',value:5,rarity:'common',foodValue:2},
        {id:'plg_food_orange',name:'Naranja',type:'food',icon:'🍊',value:4,rarity:'common',foodValue:2},
        {id:'plg_food_banana',name:'Plátano',type:'food',icon:'🍌',value:4,rarity:'common',foodValue:2},
        {id:'plg_food_strawberry',name:'Fresas',type:'food',icon:'🍓',value:6,rarity:'common',foodValue:2},
        {id:'plg_food_watermelon',name:'Sandía',type:'food',icon:'🍉',value:7,rarity:'common',foodValue:3},
        {id:'plg_food_corn',name:'Maíz',type:'food',icon:'🌽',value:5,rarity:'common',foodValue:3},
        {id:'plg_food_carrot',name:'Zanahoria',type:'food',icon:'🥕',value:3,rarity:'common',foodValue:2},
        {id:'plg_food_potato',name:'Papa',type:'food',icon:'🥔',value:4,rarity:'common',foodValue:3},
        {id:'plg_food_tomato',name:'Tomate',type:'food',icon:'🍅',value:3,rarity:'common',foodValue:2},
        {id:'plg_food_onion',name:'Cebolla',type:'food',icon:'🧅',value:2,rarity:'common',foodValue:1},
        {id:'plg_food_mushroom',name:'Champiñones',type:'food',icon:'🍄',value:6,rarity:'common',foodValue:2},
        {id:'plg_food_rice',name:'Arroz',type:'food',icon:'🍚',value:5,rarity:'common',foodValue:4},
        {id:'plg_food_noodles',name:'Fideos',type:'food',icon:'🍝',value:10,rarity:'common',foodValue:5},
        {id:'plg_food_pizza',name:'Pizza',type:'food',icon:'🍕',value:12,rarity:'common',foodValue:5},
        {id:'plg_food_burger',name:'Hamburguesa',type:'food',icon:'🍔',value:14,rarity:'common',foodValue:6},
        {id:'plg_food_taco',name:'Taco',type:'food',icon:'🌮',value:9,rarity:'common',foodValue:4},
        {id:'plg_food_sushi',name:'Sushi',type:'food',icon:'🍣',value:18,rarity:'rare',foodValue:4},
        {id:'plg_food_dumpling',name:'Dumpling',type:'food',icon:'🥟',value:10,rarity:'common',foodValue:4},
        {id:'plg_food_bacon',name:'Tocino',type:'food',icon:'🥓',value:10,rarity:'common',foodValue:4},
        {id:'plg_food_steak',name:'Filete',type:'food',icon:'🥩',value:25,rarity:'rare',foodValue:8},
        {id:'plg_food_salad',name:'Ensalada',type:'food',icon:'🥗',value:8,rarity:'common',foodValue:3},
        {id:'plg_food_sandwich',name:'Sándwich',type:'food',icon:'🥪',value:9,rarity:'common',foodValue:4},
        {id:'plg_food_cake',name:'Pastel Chocolate',type:'food',icon:'🎂',value:20,rarity:'rare',foodValue:6},
        {id:'plg_food_cookie',name:'Galletas',type:'food',icon:'🍪',value:4,rarity:'common',foodValue:2},
        {id:'plg_food_donut',name:'Dona',type:'food',icon:'🍩',value:6,rarity:'common',foodValue:2},
        {id:'plg_food_icecream',name:'Helado',type:'food',icon:'🍨',value:8,rarity:'common',foodValue:3},
        {id:'plg_food_chocolate',name:'Chocolate',type:'food',icon:'🍫',value:8,rarity:'common',foodValue:3},
        {id:'plg_food_candy',name:'Dulces',type:'food',icon:'🍬',value:4,rarity:'common',foodValue:1},
        {id:'plg_food_mead',name:'Hidromiel',type:'food',icon:'🍯',value:15,rarity:'rare',foodValue:4},
        {id:'plg_food_croissant',name:'Croissant',type:'food',icon:'🥐',value:8,rarity:'common',foodValue:3},
        {id:'plg_food_pretzel',name:'Pretzel',type:'food',icon:'🥨',value:6,rarity:'common',foodValue:2},
        {id:'plg_food_feast',name:'Festín Real',type:'food',icon:'👑',value:60,rarity:'epic',foodValue:12},
        {id:'plg_food_dragon_meat',name:'Carne Dragón',type:'food',icon:'🐲',value:80,rarity:'legendary',foodValue:15},
        {id:'plg_food_elf_bread',name:'Pan Élfico',type:'food',icon:'🧝',value:35,rarity:'epic',foodValue:10},
        {id:'plg_food_royal_jelly',name:'Jalea Real',type:'food',icon:'🐝',value:45,rarity:'epic',foodValue:8},
        {id:'plg_food_ambrosia',name:'Ambrosía',type:'food',icon:'✨',value:100,rarity:'legendary',foodValue:20},
        {id:'plg_food_phoenix_egg',name:'Huevo Fénix',type:'food',icon:'🥚',value:90,rarity:'legendary',foodValue:18}
    ];
    foods.forEach(function(f) { f.fromPlugin = true; Data.items.push(f); });

    // ═══════════════════════════════════════════════════════════════
    // PERGAMINOS (50)
    // ═══════════════════════════════════════════════════════════════
    var scrolls = [
        // Fuego
        {id:'plg_scroll_fireball',name:'Perg: Bola Fuego',type:'scroll',icon:'📜🔥',value:30,rarity:'common',spellId:'plg_sp_fireball'},
        {id:'plg_scroll_inferno',name:'Perg: Infierno',type:'scroll',icon:'📜🔥',value:60,rarity:'rare',spellId:'plg_sp_inferno'},
        {id:'plg_scroll_meteor',name:'Perg: Meteoro',type:'scroll',icon:'📜☄️',value:100,rarity:'epic',spellId:'plg_sp_meteor'},
        {id:'plg_scroll_burn',name:'Perg: Quemar',type:'scroll',icon:'📜🔥',value:20,rarity:'common',spellId:'plg_sp_burn'},
        {id:'plg_scroll_flame_wave',name:'Perg: Ola Fuego',type:'scroll',icon:'📜🔥',value:45,rarity:'rare',spellId:'plg_sp_flame_wave'},
        // Hielo
        {id:'plg_scroll_ice_ray',name:'Perg: Rayo Hielo',type:'scroll',icon:'📜❄️',value:30,rarity:'common',spellId:'plg_sp_ice_ray'},
        {id:'plg_scroll_blizzard',name:'Perg: Ventisca',type:'scroll',icon:'📜❄️',value:55,rarity:'rare',spellId:'plg_sp_blizzard'},
        {id:'plg_scroll_freeze',name:'Perg: Congelar',type:'scroll',icon:'📜❄️',value:40,rarity:'rare',spellId:'plg_sp_freeze'},
        {id:'plg_scroll_frost_nova',name:'Perg: Nova Escarcha',type:'scroll',icon:'📜❄️',value:65,rarity:'epic',spellId:'plg_sp_frost_nova'},
        {id:'plg_scroll_ice_barrier',name:'Perg: Barrera Hielo',type:'scroll',icon:'📜❄️',value:50,rarity:'rare',spellId:'plg_sp_ice_barrier'},
        // Rayo
        {id:'plg_scroll_spark',name:'Perg: Chispa',type:'scroll',icon:'📜⚡',value:15,rarity:'common',spellId:'plg_sp_spark'},
        {id:'plg_scroll_lightning',name:'Perg: Relámpago',type:'scroll',icon:'📜⚡',value:45,rarity:'rare',spellId:'plg_sp_lightning'},
        {id:'plg_scroll_thunder',name:'Perg: Trueno',type:'scroll',icon:'📜⚡',value:70,rarity:'epic',spellId:'plg_sp_thunder'},
        {id:'plg_scroll_chain_lightning',name:'Perg: Cadena Rayos',type:'scroll',icon:'📜⚡',value:80,rarity:'epic',spellId:'plg_sp_chain_lightning'},
        {id:'plg_scroll_static',name:'Perg: Estática',type:'scroll',icon:'📜⚡',value:25,rarity:'common',spellId:'plg_sp_static'},
        // Curación
        {id:'plg_scroll_heal',name:'Perg: Curar',type:'scroll',icon:'📜💚',value:25,rarity:'common',spellId:'plg_sp_heal'},
        {id:'plg_scroll_heal_greater',name:'Perg: Curación Mayor',type:'scroll',icon:'📜💚',value:50,rarity:'rare',spellId:'plg_sp_heal_greater'},
        {id:'plg_scroll_regenerate',name:'Perg: Regenerar',type:'scroll',icon:'📜💚',value:70,rarity:'epic',spellId:'plg_sp_regenerate'},
        {id:'plg_scroll_purify',name:'Perg: Purificar',type:'scroll',icon:'📜💚',value:35,rarity:'rare',spellId:'plg_sp_purify'},
        {id:'plg_scroll_resurrect',name:'Perg: Resurrección',type:'scroll',icon:'📜💚',value:150,rarity:'legendary',spellId:'plg_sp_resurrect'},
        // Oscuro
        {id:'plg_scroll_drain',name:'Perg: Drenar Vida',type:'scroll',icon:'📜💜',value:40,rarity:'rare',spellId:'plg_sp_drain'},
        {id:'plg_scroll_curse',name:'Perg: Maldición',type:'scroll',icon:'📜💜',value:35,rarity:'rare',spellId:'plg_sp_curse'},
        {id:'plg_scroll_fear',name:'Perg: Terror',type:'scroll',icon:'📜💜',value:45,rarity:'rare',spellId:'plg_sp_fear'},
        {id:'plg_scroll_shadow_bolt',name:'Perg: Rayo Oscuro',type:'scroll',icon:'📜💜',value:55,rarity:'epic',spellId:'plg_sp_shadow_bolt'},
        {id:'plg_scroll_doom',name:'Perg: Perdición',type:'scroll',icon:'📜💜',value:100,rarity:'legendary',spellId:'plg_sp_doom'},
        // Naturaleza
        {id:'plg_scroll_poison',name:'Perg: Veneno',type:'scroll',icon:'📜🌿',value:30,rarity:'common',spellId:'plg_sp_poison'},
        {id:'plg_scroll_entangle',name:'Perg: Enredar',type:'scroll',icon:'📜🌿',value:35,rarity:'rare',spellId:'plg_sp_entangle'},
        {id:'plg_scroll_thorns',name:'Perg: Espinas',type:'scroll',icon:'📜🌿',value:40,rarity:'rare',spellId:'plg_sp_thorns'},
        {id:'plg_scroll_earthquake',name:'Perg: Terremoto',type:'scroll',icon:'📜🌿',value:90,rarity:'epic',spellId:'plg_sp_earthquake'},
        {id:'plg_scroll_summon',name:'Perg: Invocar',type:'scroll',icon:'📜🐺',value:60,rarity:'epic',spellId:'plg_sp_summon'},
        // Protección
        {id:'plg_scroll_shield',name:'Perg: Escudo',type:'scroll',icon:'📜🛡️',value:25,rarity:'common',spellId:'plg_sp_shield'},
        {id:'plg_scroll_armor',name:'Perg: Armadura',type:'scroll',icon:'📜🛡️',value:40,rarity:'rare',spellId:'plg_sp_armor'},
        {id:'plg_scroll_reflect',name:'Perg: Reflejar',type:'scroll',icon:'📜🛡️',value:55,rarity:'epic',spellId:'plg_sp_reflect'},
        {id:'plg_scroll_immunity',name:'Perg: Inmunidad',type:'scroll',icon:'📜🛡️',value:80,rarity:'epic',spellId:'plg_sp_immunity'},
        {id:'plg_scroll_invincible',name:'Perg: Invencible',type:'scroll',icon:'📜🛡️',value:120,rarity:'legendary',spellId:'plg_sp_invincible'},
        // Mejora
        {id:'plg_scroll_haste',name:'Perg: Prisa',type:'scroll',icon:'📜💨',value:30,rarity:'common',spellId:'plg_sp_haste'},
        {id:'plg_scroll_strength',name:'Perg: Fuerza',type:'scroll',icon:'📜💪',value:35,rarity:'rare',spellId:'plg_sp_strength'},
        {id:'plg_scroll_precision',name:'Perg: Precisión',type:'scroll',icon:'📜🎯',value:35,rarity:'rare',spellId:'plg_sp_precision'},
        {id:'plg_scroll_berserk',name:'Perg: Furia',type:'scroll',icon:'📜😤',value:50,rarity:'epic',spellId:'plg_sp_berserk'},
        {id:'plg_scroll_divine',name:'Perg: Poder Divino',type:'scroll',icon:'📜✨',value:100,rarity:'legendary',spellId:'plg_sp_divine'},
        // Arcano
        {id:'plg_scroll_arcane',name:'Perg: Misil Arcano',type:'scroll',icon:'📜✨',value:20,rarity:'common',spellId:'plg_sp_arcane'},
        {id:'plg_scroll_teleport',name:'Perg: Teletransporte',type:'scroll',icon:'📜🌀',value:60,rarity:'rare',spellId:'plg_sp_teleport'},
        {id:'plg_scroll_invisibility',name:'Perg: Invisibilidad',type:'scroll',icon:'📜👻',value:65,rarity:'epic',spellId:'plg_sp_invisibility'},
        {id:'plg_scroll_dispel',name:'Perg: Disipar',type:'scroll',icon:'📜✨',value:40,rarity:'rare',spellId:'plg_sp_dispel'},
        {id:'plg_scroll_polymorph',name:'Perg: Polimorfía',type:'scroll',icon:'📜🐑',value:75,rarity:'epic',spellId:'plg_sp_polymorph'},
        {id:'plg_scroll_chaos',name:'Perg: Caos',type:'scroll',icon:'📜🌀',value:70,rarity:'epic',spellId:'plg_sp_chaos'},
        {id:'plg_scroll_disintegrate',name:'Perg: Desintegrar',type:'scroll',icon:'📜💥',value:110,rarity:'legendary',spellId:'plg_sp_disintegrate'},
        {id:'plg_scroll_time_stop',name:'Perg: Detener Tiempo',type:'scroll',icon:'📜⏰',value:150,rarity:'legendary',spellId:'plg_sp_time_stop'},
        {id:'plg_scroll_wish',name:'Perg: Deseo',type:'scroll',icon:'📜⭐',value:200,rarity:'legendary',spellId:'plg_sp_wish'},
        {id:'plg_scroll_mass_heal',name:'Perg: Curación Masiva',type:'scroll',icon:'📜💚',value:90,rarity:'epic',spellId:'plg_sp_mass_heal'}
    ];
    scrolls.forEach(function(s) { s.fromPlugin = true; Data.items.push(s); });

    // ═══════════════════════════════════════════════════════════════
    // ACCESORIOS (20)
    // ═══════════════════════════════════════════════════════════════
    var accessories = [
        {id:'plg_acc_regen',name:'Orbe Regeneración',type:'accessory',icon:'🔮',value:100,rarity:'epic',desc:'+1 HP/turno.'},
        {id:'plg_acc_speed',name:'Botas Velocidad',type:'accessory',icon:'👢',value:80,rarity:'rare',desc:'+3 velocidad.'},
        {id:'plg_acc_crit',name:'Anillo Crítico',type:'accessory',icon:'💍',value:120,rarity:'epic',desc:'+15% crítico.'},
        {id:'plg_acc_dodge',name:'Capa Evasión',type:'accessory',icon:'🧥',value:90,rarity:'rare',desc:'+2 evasión.'},
        {id:'plg_acc_thorns',name:'Anillo Espinas',type:'accessory',icon:'🌹',value:110,rarity:'epic',desc:'Refleja 15%.'},
        {id:'plg_acc_lifesteal',name:'Amuleto Vampírico',type:'accessory',icon:'🩸',value:130,rarity:'epic',desc:'Roba 10% vida.'},
        {id:'plg_acc_mana',name:'Gema Maná',type:'accessory',icon:'💙',value:85,rarity:'rare',desc:'+20 maná.'},
        {id:'plg_acc_xp',name:'Amuleto Sabiduría',type:'accessory',icon:'📿',value:95,rarity:'rare',desc:'+25% XP.'},
        {id:'plg_acc_gold',name:'Talismán Fortuna',type:'accessory',icon:'🍀',value:100,rarity:'rare',desc:'+30% oro.'},
        {id:'plg_acc_armor',name:'Escudo Mágico',type:'accessory',icon:'🛡️',value:90,rarity:'rare',desc:'+2 armadura.'},
        {id:'plg_acc_damage',name:'Guantelete Poder',type:'accessory',icon:'🧤',value:105,rarity:'epic',desc:'+2 daño.'},
        {id:'plg_acc_first',name:'Amuleto Iniciativa',type:'accessory',icon:'⚡',value:75,rarity:'rare',desc:'Siempre primero.'},
        {id:'plg_acc_poison_immune',name:'Perla Purificadora',type:'accessory',icon:'🫧',value:70,rarity:'rare',desc:'Inmune veneno.'},
        {id:'plg_acc_fire_immune',name:'Rubí Fénix',type:'accessory',icon:'🔴',value:85,rarity:'epic',desc:'Inmune fuego.'},
        {id:'plg_acc_ice_immune',name:'Zafiro Glacial',type:'accessory',icon:'🔵',value:85,rarity:'epic',desc:'Inmune hielo.'},
        {id:'plg_acc_lucky',name:'Trébol',type:'accessory',icon:'🍀',value:60,rarity:'rare',desc:'+10% drops.'},
        {id:'plg_acc_survivor',name:'Amuleto Superviviente',type:'accessory',icon:'💚',value:150,rarity:'legendary',desc:'Sobrevive 1HP.'},
        {id:'plg_acc_double',name:'Guantes Doble',type:'accessory',icon:'🥊',value:140,rarity:'legendary',desc:'20% doble ataque.'},
        {id:'plg_acc_counter',name:'Brazalete Contra',type:'accessory',icon:'⚔️',value:120,rarity:'epic',desc:'25% contraataque.'},
        {id:'plg_acc_heal_boost',name:'Cruz Sagrada',type:'accessory',icon:'✝️',value:80,rarity:'rare',desc:'+50% curación.'}
    ];
    accessories.forEach(function(a) { a.fromPlugin = true; Data.items.push(a); });

    // ═══════════════════════════════════════════════════════════════
    // ARMAS (55)
    // ═══════════════════════════════════════════════════════════════
    var weapons = [
        // Básicas
        {id:'plg_wpn_club',name:'Garrote',damage:'1d4',icon:'🪵',value:5,rarity:'common',weight:2},
        {id:'plg_wpn_dagger',name:'Daga',damage:'1d4',icon:'🗡️',value:15,rarity:'common',weight:1},
        {id:'plg_wpn_short',name:'Espada Corta',damage:'1d6',icon:'🗡️',value:30,rarity:'common',weight:2},
        {id:'plg_wpn_long',name:'Espada Larga',damage:'1d8',icon:'⚔️',value:60,rarity:'rare',weight:3},
        {id:'plg_wpn_great',name:'Mandoble',damage:'2d6',icon:'⚔️',value:120,rarity:'epic',weight:6},
        {id:'plg_wpn_rapier',name:'Estoque',damage:'1d6',icon:'🤺',value:50,rarity:'rare',weight:1},
        {id:'plg_wpn_scimitar',name:'Cimitarra',damage:'1d6',icon:'🔪',value:45,rarity:'rare',weight:2},
        {id:'plg_wpn_falchion',name:'Alfanje',damage:'1d8',icon:'🗡️',value:55,rarity:'rare',weight:3},
        {id:'plg_wpn_katana',name:'Katana',damage:'1d10',icon:'⚔️',value:100,rarity:'epic',weight:2},
        {id:'plg_wpn_claymore',name:'Claymore',damage:'2d6',icon:'⚔️',value:130,rarity:'epic',weight:7},
        {id:'plg_wpn_zweihander',name:'Zweihänder',damage:'2d8',icon:'⚔️',value:180,rarity:'legendary',weight:8},
        // Hachas
        {id:'plg_wpn_handaxe',name:'Hacha Mano',damage:'1d6',icon:'🪓',value:25,rarity:'common',weight:2},
        {id:'plg_wpn_axe',name:'Hacha Batalla',damage:'1d10',icon:'🪓',value:70,rarity:'rare',weight:5},
        {id:'plg_wpn_greataxe',name:'Hacha Doble',damage:'1d12',icon:'🪓',value:100,rarity:'epic',weight:6},
        // Mazas
        {id:'plg_wpn_mace',name:'Maza',damage:'1d6',icon:'⚒️',value:30,rarity:'common',weight:4},
        {id:'plg_wpn_morningstar',name:'Lucero Alba',damage:'1d8',icon:'⚒️',value:55,rarity:'rare',weight:4},
        {id:'plg_wpn_hammer',name:'Martillo Guerra',damage:'1d10',icon:'🔨',value:75,rarity:'rare',weight:6},
        {id:'plg_wpn_flail',name:'Mangual',damage:'1d8',icon:'⛓️',value:50,rarity:'rare',weight:4},
        // Lanzas
        {id:'plg_wpn_spear',name:'Lanza',damage:'1d8',icon:'🔱',value:35,rarity:'common',weight:3},
        {id:'plg_wpn_pike',name:'Pica',damage:'1d10',icon:'🔱',value:65,rarity:'rare',weight:5},
        {id:'plg_wpn_halberd',name:'Alabarda',damage:'1d10',icon:'🔱',value:80,rarity:'rare',weight:5},
        {id:'plg_wpn_trident',name:'Tridente',damage:'1d8',icon:'🔱',value:60,rarity:'rare',weight:3},
        {id:'plg_wpn_lance',name:'Lanza Caballero',damage:'1d12',icon:'🔱',value:95,rarity:'epic',weight:5},
        // Arcos
        {id:'plg_wpn_shortbow',name:'Arco Corto',damage:'1d6',icon:'🏹',value:35,rarity:'common',weight:1},
        {id:'plg_wpn_bow',name:'Arco Largo',damage:'1d8',icon:'🏹',value:60,rarity:'rare',weight:2},
        {id:'plg_wpn_longbow',name:'Arco Élfico',damage:'1d10',icon:'🏹',value:120,rarity:'epic',weight:2},
        {id:'plg_wpn_xbow',name:'Ballesta',damage:'1d10',icon:'🎯',value:80,rarity:'rare',weight:4},
        // Armas exóticas
        {id:'plg_wpn_whip',name:'Látigo',damage:'1d4',icon:'〰️',value:25,rarity:'common',weight:1},
        {id:'plg_wpn_nunchaku',name:'Nunchaku',damage:'1d6',icon:'⛓️',value:40,rarity:'rare',weight:1},
        {id:'plg_wpn_sickle',name:'Hoz',damage:'1d4',icon:'🌙',value:18,rarity:'common',weight:1},
        {id:'plg_wpn_scythe',name:'Guadaña',damage:'2d4',icon:'🌙',value:90,rarity:'epic',weight:5},
        // Mágicas
        {id:'plg_wpn_wand',name:'Varita',damage:'1d4',icon:'✨',value:40,rarity:'common',weight:0,magic:true,manaBonus:10},
        {id:'plg_wpn_staff',name:'Bastón',damage:'1d6',icon:'🪄',value:60,rarity:'rare',weight:2,magic:true,manaBonus:15},
        {id:'plg_wpn_staff_fire',name:'Bastón Fuego',damage:'1d6',icon:'🔥',value:90,rarity:'rare',weight:2,magic:true,manaBonus:15,effect:'fire'},
        {id:'plg_wpn_staff_ice',name:'Bastón Hielo',damage:'1d6',icon:'❄️',value:90,rarity:'rare',weight:2,magic:true,manaBonus:15,effect:'ice'},
        {id:'plg_wpn_staff_thunder',name:'Bastón Trueno',damage:'1d8',icon:'⚡',value:110,rarity:'epic',weight:2,magic:true,manaBonus:20},
        {id:'plg_wpn_staff_nature',name:'Bastón Natura',damage:'1d4',icon:'🌿',value:80,rarity:'rare',weight:1,magic:true,manaBonus:25},
        {id:'plg_wpn_staff_dark',name:'Bastón Oscuro',damage:'1d10',icon:'🌑',value:130,rarity:'epic',weight:3,magic:true,manaBonus:10},
        {id:'plg_wpn_staff_holy',name:'Bastón Sagrado',damage:'1d8',icon:'✝️',value:140,rarity:'epic',weight:2,magic:true,manaBonus:20},
        {id:'plg_wpn_staff_arcane',name:'Bastón Arcano',damage:'1d8',icon:'🔮',value:180,rarity:'legendary',weight:2,magic:true,manaBonus:30},
        {id:'plg_wpn_staff_void',name:'Bastón Vacío',damage:'2d6',icon:'🕳️',value:220,rarity:'legendary',weight:3,magic:true,manaBonus:25},
        {id:'plg_wpn_orb',name:'Orbe',damage:'1d6',icon:'🔮',value:100,rarity:'epic',weight:1,magic:true,manaBonus:20},
        {id:'plg_wpn_crystal',name:'Cristal Arcano',damage:'2d4',icon:'💎',value:120,rarity:'epic',weight:1,magic:true,manaBonus:30},
        {id:'plg_wpn_grimoire',name:'Grimorio',damage:'1d6',icon:'📕',value:110,rarity:'epic',weight:1,magic:true,manaBonus:35},
        {id:'plg_wpn_tome',name:'Tomo Antiguo',damage:'1d6',icon:'📖',value:90,rarity:'rare',weight:2,magic:true,manaBonus:20},
        {id:'plg_wpn_scepter',name:'Cetro',damage:'1d8',icon:'👑',value:150,rarity:'epic',weight:2,magic:true,manaBonus:25},
        // Legendarias
        {id:'plg_wpn_excalibur',name:'Excalibur',damage:'2d10',icon:'⚔️',value:500,rarity:'legendary',weight:4},
        {id:'plg_wpn_mjolnir',name:'Mjolnir',damage:'2d8',icon:'🔨',value:450,rarity:'legendary',weight:5,effect:'thunder'},
        {id:'plg_wpn_gungnir',name:'Gungnir',damage:'2d8',icon:'🔱',value:400,rarity:'legendary',weight:4},
        {id:'plg_wpn_masamune',name:'Masamune',damage:'2d8',icon:'⚔️',value:420,rarity:'legendary',weight:2},
        {id:'plg_wpn_soul_reaper',name:'Segadora Almas',damage:'2d10',icon:'🌙',value:480,rarity:'legendary',weight:5,magic:true,manaBonus:20},
        {id:'plg_wpn_dragon_slayer',name:'Matadragones',damage:'3d6',icon:'🐲',value:550,rarity:'legendary',weight:7},
        {id:'plg_wpn_holy_avenger',name:'Vengador Sagrado',damage:'2d8',icon:'✝️',value:460,rarity:'legendary',weight:4},
        {id:'plg_wpn_frostmourne',name:'Frostmourne',damage:'2d10',icon:'❄️',value:500,rarity:'legendary',weight:5,magic:true,effect:'ice'}
    ];
    weapons.forEach(function(w) { w.fromPlugin = true; Data.weapons.push(w); });

    // ═══════════════════════════════════════════════════════════════
    // ARMADURAS (42)
    // ═══════════════════════════════════════════════════════════════
    var armors = [
        // Ligeras
        {id:'plg_arm_cloth',name:'Ropa',defense:0,icon:'👕',value:5,rarity:'common',weight:0},
        {id:'plg_arm_padded',name:'Acolchada',defense:1,icon:'👕',value:15,rarity:'common',weight:1},
        {id:'plg_arm_leather',name:'Cuero',defense:2,icon:'🦺',value:40,rarity:'common',weight:2},
        {id:'plg_arm_studded',name:'Tachonado',defense:3,icon:'🦺',value:60,rarity:'rare',weight:3},
        {id:'plg_arm_hide',name:'Pieles',defense:2,icon:'🧥',value:35,rarity:'common',weight:3},
        {id:'plg_arm_brigandine',name:'Brigantina',defense:4,icon:'🦺',value:85,rarity:'rare',weight:4},
        // Medias
        {id:'plg_arm_ring',name:'Anillas',defense:3,icon:'⛓️',value:65,rarity:'rare',weight:4},
        {id:'plg_arm_chain',name:'Malla',defense:4,icon:'⛓️',value:90,rarity:'rare',weight:5},
        {id:'plg_arm_scale',name:'Escamas',defense:4,icon:'🐉',value:100,rarity:'rare',weight:5},
        {id:'plg_arm_splint',name:'Tablillas',defense:5,icon:'🛡️',value:110,rarity:'epic',weight:5},
        {id:'plg_arm_banded',name:'Bandas',defense:5,icon:'🛡️',value:105,rarity:'epic',weight:5},
        // Pesadas
        {id:'plg_arm_breast',name:'Coraza',defense:5,icon:'🛡️',value:130,rarity:'epic',weight:4},
        {id:'plg_arm_half',name:'Media Placa',defense:6,icon:'🛡️',value:160,rarity:'epic',weight:6},
        {id:'plg_arm_plate',name:'Placas',defense:7,icon:'🛡️',value:220,rarity:'epic',weight:7},
        {id:'plg_arm_full',name:'Completa',defense:8,icon:'⚔️',value:280,rarity:'legendary',weight:8},
        {id:'plg_arm_gothic',name:'Gótica',defense:8,icon:'⚔️',value:300,rarity:'legendary',weight:8},
        {id:'plg_arm_jousting',name:'Torneo',defense:9,icon:'🏇',value:380,rarity:'legendary',weight:10},
        // Especiales
        {id:'plg_arm_dragon',name:'Dragón',defense:7,icon:'🐲',value:350,rarity:'legendary',weight:4},
        {id:'plg_arm_shadow',name:'Sombras',defense:3,icon:'🌑',value:110,rarity:'epic',weight:1},
        {id:'plg_arm_mithril',name:'Mithril',defense:6,icon:'✨',value:300,rarity:'legendary',weight:2},
        {id:'plg_arm_adamant',name:'Adamantina',defense:9,icon:'💎',value:450,rarity:'legendary',weight:6},
        {id:'plg_arm_crystal',name:'Cristal',defense:4,icon:'💎',value:160,rarity:'epic',weight:2},
        {id:'plg_arm_bone',name:'Huesos',defense:3,icon:'💀',value:75,rarity:'rare',weight:4},
        {id:'plg_arm_chitin',name:'Quitina',defense:4,icon:'🪲',value:95,rarity:'rare',weight:3},
        {id:'plg_arm_bark',name:'Corteza',defense:3,icon:'🌳',value:60,rarity:'rare',weight:4},
        {id:'plg_arm_coral',name:'Coral',defense:4,icon:'🪸',value:105,rarity:'epic',weight:4},
        {id:'plg_arm_volcanic',name:'Volcánica',defense:5,icon:'🌋',value:140,rarity:'epic',weight:5},
        {id:'plg_arm_frost',name:'Escarcha',defense:5,icon:'❄️',value:140,rarity:'epic',weight:4},
        {id:'plg_arm_thunder',name:'Tormenta',defense:5,icon:'⚡',value:150,rarity:'epic',weight:4},
        // Túnicas mágicas
        {id:'plg_arm_mage',name:'Túnica Mago',defense:1,icon:'🧥',value:70,rarity:'rare',weight:0,magic:true,manaBonus:20},
        {id:'plg_arm_warlock',name:'Manto Brujo',defense:2,icon:'🖤',value:100,rarity:'rare',weight:0,magic:true,manaBonus:25},
        {id:'plg_arm_priest',name:'Vestiduras',defense:2,icon:'✝️',value:95,rarity:'rare',weight:0,magic:true,manaBonus:25},
        {id:'plg_arm_druid',name:'Túnica Druida',defense:2,icon:'🌿',value:90,rarity:'rare',weight:0,magic:true,manaBonus:20},
        {id:'plg_arm_necro',name:'Ropajes Oscuros',defense:1,icon:'💀',value:105,rarity:'epic',weight:0,magic:true,manaBonus:30},
        {id:'plg_arm_elemental',name:'Vestido Elemental',defense:3,icon:'🌀',value:130,rarity:'epic',weight:1,magic:true,manaBonus:35},
        {id:'plg_arm_archmage',name:'Túnica Archimago',defense:2,icon:'🧙',value:170,rarity:'legendary',weight:0,magic:true,manaBonus:40},
        {id:'plg_arm_celestial',name:'Manto Celestial',defense:4,icon:'👼',value:220,rarity:'legendary',weight:0,magic:true,manaBonus:50},
        {id:'plg_arm_void',name:'Armadura Vacío',defense:5,icon:'🕳️',value:280,rarity:'legendary',weight:2,magic:true,manaBonus:40},
        {id:'plg_arm_phoenix',name:'Plumas Fénix',defense:4,icon:'🔥',value:250,rarity:'legendary',weight:1,magic:true,manaBonus:30},
        {id:'plg_arm_starweave',name:'Telar Estelar',defense:3,icon:'⭐',value:200,rarity:'legendary',weight:0,magic:true,manaBonus:45},
        {id:'plg_arm_runic',name:'Runas',defense:4,icon:'🔮',value:180,rarity:'epic',weight:2,magic:true,manaBonus:25}
    ];
    armors.forEach(function(a) { a.fromPlugin = true; Data.armors.push(a); });

    // ═══════════════════════════════════════════════════════════════
    // ENEMIGOS (65)
    // ═══════════════════════════════════════════════════════════════
    var enemies = [
        // Tier 1
        {id:'plg_rat',name:'Rata Gigante',health:8,damage:'1d4',difficulty:6,armor:0,speed:14,icon:'🐀',loot:[2,8],drops:[{itemId:'plg_rat_tail',chance:70},{itemId:'plg_rat_fur',chance:50},{itemId:'plg_coin_copper',chance:30}],regions:['mazmorra','pueblo'],canGroup:true,groupMin:3,groupMax:6,groupChance:60},
        {id:'plg_bat',name:'Murciélago',health:6,damage:'1d3',difficulty:7,armor:0,speed:16,icon:'🦇',loot:[3,8],drops:[{itemId:'plg_bat_wing',chance:60},{itemId:'plg_bat_ear',chance:40},{itemId:'plg_coin_copper',chance:25}],regions:['mazmorra','plg_catacumbas'],canGroup:true,groupMin:3,groupMax:5,groupChance:70},
        {id:'plg_spider',name:'Araña',health:10,damage:'1d4',difficulty:8,armor:0,speed:13,icon:'🕷️',effect:'poison',loot:[5,15],drops:[{itemId:'plg_spider_silk',chance:60},{itemId:'plg_venom',chance:15},{itemId:'plg_spider_leg',chance:50}],regions:['bosque','mazmorra'],canGroup:true,groupMin:2,groupMax:4,groupChance:40},
        {id:'plg_slime',name:'Slime',health:15,damage:'1d4',difficulty:6,armor:0,speed:6,icon:'🟢',loot:[3,10],drops:[{itemId:'plg_slime',chance:80},{itemId:'plg_slime_core',chance:30},{itemId:'plg_gem_rough',chance:10}],regions:['mazmorra','pantano'],canGroup:true,groupMin:2,groupMax:5,groupChance:50},
        {id:'plg_goblin',name:'Goblin',health:10,damage:'1d6',difficulty:8,armor:1,speed:11,icon:'👺',loot:[8,18],drops:[{itemId:'plg_goblin_ear',chance:60},{itemId:'plg_copper',chance:20},{itemId:'plg_goblin_nose',chance:40},{itemId:'plg_coin_copper',chance:50},{itemId:'plg_key_rusty',chance:15}],regions:['bosque','mazmorra'],canGroup:true,groupMin:2,groupMax:5,groupChance:60},
        {id:'plg_kobold',name:'Kobold',health:8,damage:'1d4',difficulty:7,armor:0,speed:12,icon:'🦎',loot:[5,12],drops:[{itemId:'plg_scale',chance:20},{itemId:'plg_kobold_scale',chance:50},{itemId:'plg_torch',chance:30}],regions:['mazmorra'],canGroup:true,groupMin:3,groupMax:6,groupChance:70},
        {id:'plg_wolf',name:'Lobo',health:14,damage:'1d6',difficulty:9,armor:0,speed:14,icon:'🐺',loot:[10,20],drops:[{itemId:'plg_wolf_pelt',chance:50},{itemId:'plg_fang',chance:30},{itemId:'plg_wolf_tooth',chance:40}],regions:['bosque'],canGroup:true,groupMin:2,groupMax:4,groupChance:50},
        {id:'plg_zombie',name:'Zombi',health:18,damage:'1d6',difficulty:8,armor:0,speed:6,icon:'🧟',loot:[8,20],drops:[{itemId:'plg_zombie_flesh',chance:70},{itemId:'plg_bone',chance:40},{itemId:'plg_zombie_eye',chance:35},{itemId:'plg_old_ring',chance:10}],regions:['plg_cementerio','plg_catacumbas'],canGroup:true,groupMin:2,groupMax:4,groupChance:50},
        {id:'plg_skeleton',name:'Esqueleto',health:12,damage:'1d6',difficulty:9,armor:1,speed:10,icon:'💀',loot:[10,20],drops:[{itemId:'plg_bone',chance:80},{itemId:'plg_skull',chance:20},{itemId:'plg_skeleton_finger',chance:50},{itemId:'plg_coin_silver',chance:25},{itemId:'plg_old_letter',chance:10}],regions:['mazmorra','plg_catacumbas','plg_cementerio'],canGroup:true,groupMin:2,groupMax:3,groupChance:40},
        {id:'plg_imp',name:'Diablillo',health:10,damage:'1d6',difficulty:10,armor:0,speed:15,icon:'😈',effect:'fire',loot:[12,25],drops:[{itemId:'plg_ember',chance:30},{itemId:'plg_imp_tail',chance:50},{itemId:'plg_mana_shard',chance:25}],regions:['plg_torre','plg_volcan'],canGroup:true,groupMin:2,groupMax:3,groupChance:30},
        // Tier 2
        {id:'plg_orc',name:'Orco',health:22,damage:'1d8',difficulty:10,armor:2,speed:10,icon:'👹',loot:[15,30],drops:[{itemId:'plg_leather',chance:40},{itemId:'plg_iron',chance:20},{itemId:'plg_coin_silver',chance:40},{itemId:'plg_key_brass',chance:15}],regions:['bosque','montana'],canGroup:true,groupMin:2,groupMax:4,groupChance:50},
        {id:'plg_hobgoblin',name:'Hobgoblin',health:18,damage:'1d8',difficulty:10,armor:3,speed:10,icon:'👺',loot:[12,25],drops:[{itemId:'plg_iron',chance:30},{itemId:'plg_coin_silver',chance:35},{itemId:'plg_lockpick',chance:20}],regions:['mazmorra'],canGroup:true,groupMin:2,groupMax:3,groupChance:40},
        {id:'plg_ghost',name:'Fantasma',health:20,damage:'1d6',difficulty:12,armor:0,speed:14,icon:'👻',loot:[15,30],drops:[{itemId:'plg_ectoplasm',chance:50},{itemId:'plg_shadow',chance:15},{itemId:'plg_spirit_wisp',chance:40},{itemId:'plg_old_letter',chance:20}],regions:['plg_cementerio','plg_catacumbas'],canGroup:false},
        {id:'plg_ghoul',name:'Necrófago',health:25,damage:'1d8',difficulty:11,armor:1,speed:12,icon:'👹',effect:'poison',loot:[18,35],drops:[{itemId:'plg_claw',chance:40},{itemId:'plg_bone',chance:50},{itemId:'plg_broken_amulet',chance:15}],regions:['plg_cementerio','plg_catacumbas'],canGroup:true,groupMin:2,groupMax:3,groupChance:30},
        {id:'plg_banshee',name:'Banshee',health:22,damage:'1d8',difficulty:13,armor:0,speed:13,icon:'👻',loot:[20,40],drops:[{itemId:'plg_ectoplasm',chance:60},{itemId:'plg_shadow',chance:25},{itemId:'plg_spirit_wisp',chance:50},{itemId:'plg_jewel_small',chance:20}],regions:['plg_cementerio'],canGroup:false},
        {id:'plg_gargoyle',name:'Gárgola',health:30,damage:'1d8',difficulty:12,armor:4,speed:10,icon:'🗿',loot:[25,45],drops:[{itemId:'plg_iron',chance:40},{itemId:'plg_golem_core',chance:10},{itemId:'plg_rune_stone',chance:30},{itemId:'plg_gem_rough',chance:25}],regions:['plg_torre'],canGroup:true,groupMin:2,groupMax:2,groupChance:25},
        {id:'plg_golem',name:'Golem',health:40,damage:'1d10',difficulty:13,armor:5,speed:6,icon:'🗿',loot:[30,50],drops:[{itemId:'plg_golem_core',chance:25},{itemId:'plg_iron',chance:60},{itemId:'plg_elemental_shard',chance:20},{itemId:'plg_coin_gold',chance:40}],regions:['plg_torre','mazmorra'],canGroup:false},
        {id:'plg_harpy',name:'Arpía',health:22,damage:'1d8',difficulty:11,armor:0,speed:16,icon:'🦅',loot:[20,40],drops:[{itemId:'plg_feather',chance:50},{itemId:'plg_claw',chance:30},{itemId:'plg_jewel_small',chance:20},{itemId:'plg_map_piece',chance:15}],regions:['montana'],canGroup:true,groupMin:2,groupMax:3,groupChance:35},
        {id:'plg_crab',name:'Cangrejo',health:35,damage:'1d10',difficulty:12,armor:5,speed:8,icon:'🦀',loot:[20,45],drops:[{itemId:'plg_shell',chance:70},{itemId:'plg_pearl',chance:10},{itemId:'plg_coin_ancient',chance:15}],regions:['plg_abismo','pantano'],canGroup:false},
        {id:'plg_shark',name:'Tiburón',health:40,damage:'2d6',difficulty:13,armor:1,speed:14,icon:'🦈',loot:[25,50],drops:[{itemId:'plg_tooth',chance:60},{itemId:'plg_pearl',chance:20},{itemId:'plg_treasure_small',chance:10}],regions:['plg_abismo'],canGroup:false},
        // Tier 3
        {id:'plg_werewolf',name:'Licántropo',health:35,damage:'1d10',difficulty:14,armor:2,speed:15,icon:'🐺',effect:'bleed',loot:[25,50],drops:[{itemId:'plg_fur',chance:50},{itemId:'plg_werewolf_claw',chance:30},{itemId:'plg_lucky_charm',chance:15}],regions:['bosque'],canGroup:false},
        {id:'plg_ogre',name:'Ogro',health:50,damage:'2d6',difficulty:13,armor:2,speed:7,icon:'👹',loot:[30,60],drops:[{itemId:'plg_leather',chance:40},{itemId:'plg_bone',chance:30},{itemId:'plg_coin_gold',chance:35},{itemId:'plg_nugget_gold',chance:10}],regions:['montana','pantano'],canGroup:false},
        {id:'plg_troll',name:'Troll',health:55,damage:'2d6',difficulty:14,armor:2,speed:8,icon:'🧌',loot:[35,65],drops:[{itemId:'plg_troll_blood',chance:40},{itemId:'plg_claw',chance:30},{itemId:'plg_treasure_small',chance:15}],regions:['pantano','montana'],canGroup:false},
        {id:'plg_minotaur',name:'Minotauro',health:45,damage:'2d8',difficulty:15,armor:3,speed:10,icon:'🐂',loot:[40,80],drops:[{itemId:'plg_horn',chance:40},{itemId:'plg_leather',chance:50},{itemId:'plg_key_silver',chance:20},{itemId:'plg_idol_small',chance:15}],regions:['mazmorra'],canGroup:false},
        {id:'plg_mermaid',name:'Sirena',health:28,damage:'1d8',difficulty:12,armor:0,speed:13,icon:'🧜',loot:[30,55],drops:[{itemId:'plg_mermaid_scale',chance:40},{itemId:'plg_pearl',chance:25},{itemId:'plg_jewel_small',chance:30},{itemId:'plg_mysterious_orb',chance:10}],regions:['plg_abismo'],canGroup:false},
        {id:'plg_salamander',name:'Salamandra',health:30,damage:'1d10',difficulty:12,armor:1,speed:12,icon:'🦎',effect:'fire',loot:[25,45],drops:[{itemId:'plg_ember',chance:50},{itemId:'plg_scale',chance:20},{itemId:'plg_elemental_shard',chance:25}],regions:['plg_volcan'],canGroup:true,groupMin:2,groupMax:2,groupChance:30},
        {id:'plg_vampire',name:'Vampiro',health:40,damage:'1d8',difficulty:14,armor:1,speed:14,icon:'🧛',loot:[35,70],drops:[{itemId:'plg_vampire_fang',chance:50},{itemId:'plg_shadow',chance:30},{itemId:'plg_coin_gold',chance:50},{itemId:'plg_ancient_coin',chance:20}],regions:['plg_catacumbas'],canGroup:false},
        {id:'plg_necromancer',name:'Nigromante',health:25,damage:'1d8',difficulty:14,armor:0,speed:10,icon:'🧙‍♂️',usesMana:true,loot:[30,60],drops:[{itemId:'plg_book_empty',chance:20},{itemId:'plg_shadow',chance:40},{itemId:'plg_skull',chance:30},{itemId:'plg_scroll_blank',chance:35},{itemId:'plg_magic_ink',chance:25}],regions:['plg_catacumbas','plg_cementerio'],canGroup:false},
        {id:'plg_wizard',name:'Mago Oscuro',health:30,damage:'2d6',difficulty:14,armor:0,speed:11,icon:'🧙',usesMana:true,loot:[35,65],drops:[{itemId:'plg_book_empty',chance:25},{itemId:'plg_crystal',chance:30},{itemId:'plg_scroll_blank',chance:40},{itemId:'plg_mana_shard',chance:35},{itemId:'plg_arcane_dust',chance:50}],regions:['plg_torre'],canGroup:false},
        {id:'plg_ice_elem',name:'Elem. Hielo',health:30,damage:'1d8',difficulty:13,armor:2,speed:10,icon:'❄️',effect:'ice',loot:[25,50],drops:[{itemId:'plg_frost',chance:60},{itemId:'plg_sapphire',chance:5},{itemId:'plg_elemental_shard',chance:35}],regions:['montana'],canGroup:false},
        {id:'plg_fire_elem',name:'Elem. Fuego',health:30,damage:'1d10',difficulty:13,armor:1,speed:12,icon:'🔥',effect:'fire',loot:[25,50],drops:[{itemId:'plg_ember',chance:60},{itemId:'plg_ruby',chance:5},{itemId:'plg_elemental_shard',chance:35}],regions:['plg_volcan'],canGroup:false},
        {id:'plg_elemental',name:'Elem. Arcano',health:35,damage:'1d10',difficulty:14,armor:2,speed:11,icon:'✨',loot:[30,55],drops:[{itemId:'plg_crystal',chance:50},{itemId:'plg_magic_essence',chance:15},{itemId:'plg_elemental_shard',chance:50},{itemId:'plg_mana_shard',chance:40}],regions:['plg_torre'],canGroup:false},
        {id:'plg_lava_golem',name:'Golem Lava',health:50,damage:'2d6',difficulty:15,armor:4,speed:6,icon:'🌋',effect:'fire',loot:[40,70],drops:[{itemId:'plg_ember',chance:70},{itemId:'plg_golem_core',chance:30},{itemId:'plg_ruby',chance:10}],regions:['plg_volcan'],canGroup:false},
        {id:'plg_sea_serpent',name:'Serp. Marina',health:55,damage:'2d8',difficulty:15,armor:3,speed:12,icon:'🐉',loot:[45,80],drops:[{itemId:'plg_scale',chance:50},{itemId:'plg_pearl',chance:30},{itemId:'plg_treasure_small',chance:25}],regions:['plg_abismo'],canGroup:false},
        {id:'plg_kraken_tentacle',name:'Tentáculo',health:40,damage:'1d12',difficulty:14,armor:2,speed:10,icon:'🦑',loot:[35,65],drops:[{itemId:'plg_kraken_ink',chance:50}],regions:['plg_abismo'],canGroup:true,groupMin:2,groupMax:4,groupChance:40},
        {id:'plg_manticore',name:'Mantícora',health:45,damage:'2d6',difficulty:15,armor:2,speed:13,icon:'🦁',effect:'poison',loot:[45,80],drops:[{itemId:'plg_manticore_spike',chance:50},{itemId:'plg_fur',chance:40}],regions:['montana'],canGroup:false},
        {id:'plg_chimera',name:'Quimera',health:55,damage:'2d8',difficulty:16,armor:3,speed:11,icon:'🐲',loot:[55,100],drops:[{itemId:'plg_chimera_mane',chance:40}],regions:['montana'],canGroup:false},
        {id:'plg_medusa',name:'Medusa',health:35,damage:'1d8',difficulty:15,armor:1,speed:10,icon:'🐍',loot:[40,70],drops:[{itemId:'plg_basilisk_eye',chance:30},{itemId:'plg_venom',chance:40}],regions:['mazmorra'],canGroup:false},
        {id:'plg_cyclops',name:'Cíclope',health:60,damage:'2d8',difficulty:15,armor:3,speed:7,icon:'👁️',loot:[50,90],drops:[{itemId:'plg_eye',chance:40},{itemId:'plg_leather',chance:50}],regions:['montana'],canGroup:false},
        // Tier 4 - Jefes
        {id:'plg_dragon_young',name:'Dragón Joven',health:60,damage:'2d8',difficulty:16,armor:4,speed:12,icon:'🐲',effect:'fire',loot:[60,120],drops:[{itemId:'plg_dragon_scale',chance:60},{itemId:'plg_heart',chance:20}],regions:['montana','plg_volcan'],canGroup:false},
        {id:'plg_phoenix',name:'Fénix',health:50,damage:'2d10',difficulty:17,armor:2,speed:16,icon:'🔥',effect:'fire',loot:[70,130],drops:[{itemId:'plg_phoenix_ash',chance:40},{itemId:'plg_feather',chance:60}],regions:['plg_volcan'],canGroup:false},
        {id:'plg_lich',name:'Lich',health:55,damage:'2d8',difficulty:17,armor:2,speed:10,icon:'💀',usesMana:true,loot:[65,120],drops:[{itemId:'plg_skull',chance:70},{itemId:'plg_soul_gem',chance:20}],regions:['plg_catacumbas'],canGroup:false},
        {id:'plg_demon',name:'Demonio Mayor',health:70,damage:'2d10',difficulty:18,armor:3,speed:12,icon:'👿',effect:'fire',loot:[80,150],drops:[{itemId:'plg_demon_horn',chance:50},{itemId:'plg_shadow',chance:40}],regions:['plg_volcan','plg_catacumbas'],canGroup:false},
        {id:'plg_vampire_lord',name:'Señor Vampiro',health:65,damage:'2d8',difficulty:18,armor:3,speed:14,icon:'🧛',loot:[90,170],drops:[{itemId:'plg_vampire_fang',chance:70},{itemId:'plg_shadow',chance:60}],regions:['plg_catacumbas'],canGroup:false},
        {id:'plg_dragon_elder',name:'Dragón Anciano',health:100,damage:'3d8',difficulty:20,armor:6,speed:10,icon:'🐉',effect:'fire',loot:[150,300],drops:[{itemId:'plg_dragon_scale',chance:80},{itemId:'plg_dragon_blood',chance:50},{itemId:'plg_diamond',chance:20}],regions:['plg_volcan'],canGroup:false},
        {id:'plg_kraken',name:'Kraken',health:90,damage:'3d6',difficulty:19,armor:4,speed:8,icon:'🦑',loot:[120,250],drops:[{itemId:'plg_kraken_ink',chance:80},{itemId:'plg_pearl',chance:50}],regions:['plg_abismo'],canGroup:false},
        {id:'plg_archmage',name:'Archimago',health:45,damage:'2d10',difficulty:18,armor:1,speed:12,icon:'🧙‍♂️',usesMana:true,loot:[80,150],drops:[{itemId:'plg_book_empty',chance:60},{itemId:'plg_crystal',chance:50},{itemId:'plg_magic_essence',chance:30}],regions:['plg_torre'],canGroup:false},
        {id:'plg_hydra',name:'Hidra',health:80,damage:'2d10',difficulty:18,armor:4,speed:9,icon:'🐍',effect:'poison',loot:[100,200],drops:[{itemId:'plg_hydra_fang',chance:60},{itemId:'plg_scale',chance:50}],regions:['pantano'],canGroup:false},
        {id:'plg_titan',name:'Titán',health:120,damage:'3d10',difficulty:20,armor:5,speed:8,icon:'🗿',loot:[180,350],drops:[{itemId:'plg_golem_core',chance:70},{itemId:'plg_adamantine',chance:30}],regions:['montana'],canGroup:false},
        {id:'plg_balrog',name:'Balrog',health:100,damage:'3d8',difficulty:20,armor:4,speed:10,icon:'😈',effect:'fire',loot:[160,300],drops:[{itemId:'plg_demon_horn',chance:70},{itemId:'plg_ember',chance:80}],regions:['plg_volcan'],canGroup:false},
        {id:'plg_tarrasque',name:'Tarrasca',health:150,damage:'4d8',difficulty:22,armor:8,speed:8,icon:'🦖',loot:[250,500],drops:[{itemId:'plg_scale',chance:90},{itemId:'plg_heart',chance:60},{itemId:'plg_diamond',chance:40}],regions:['montana'],canGroup:false},
        // Extra
        {id:'plg_bugbear',name:'Osgo',health:28,damage:'1d10',difficulty:12,armor:1,speed:11,icon:'🐻',loot:[20,40],drops:[{itemId:'plg_fur',chance:50}],regions:['bosque'],canGroup:false},
        {id:'plg_ettin',name:'Ettin',health:48,damage:'2d6',difficulty:14,armor:2,speed:8,icon:'👹',loot:[35,70],drops:[{itemId:'plg_leather',chance:60}],regions:['montana'],canGroup:false},
        {id:'plg_drow',name:'Drow',health:20,damage:'1d8',difficulty:12,armor:2,speed:13,icon:'🧝',loot:[25,50],drops:[{itemId:'plg_shadow',chance:30}],regions:['mazmorra'],canGroup:true,groupMin:2,groupMax:3,groupChance:30},
        {id:'plg_dryad',name:'Dríade',health:25,damage:'1d6',difficulty:11,armor:0,speed:12,icon:'🌳',loot:[20,40],drops:[{itemId:'plg_herb_rare',chance:50}],regions:['bosque'],canGroup:false},
        {id:'plg_treant',name:'Ent',health:70,damage:'2d8',difficulty:15,armor:4,speed:5,icon:'🌲',loot:[40,80],drops:[{itemId:'plg_herb_rare',chance:60},{itemId:'plg_hardwood',chance:40}],regions:['bosque'],canGroup:false},
        {id:'plg_wight',name:'Espectro',health:30,damage:'1d8',difficulty:13,armor:1,speed:11,icon:'👤',loot:[25,50],drops:[{itemId:'plg_shadow',chance:40},{itemId:'plg_soul_gem',chance:10}],regions:['plg_catacumbas'],canGroup:false},
        {id:'plg_wraith',name:'Aparición',health:25,damage:'1d10',difficulty:14,armor:0,speed:13,icon:'👻',loot:[30,55],drops:[{itemId:'plg_shadow',chance:50},{itemId:'plg_ectoplasm',chance:30}],regions:['plg_cementerio'],canGroup:false},
        {id:'plg_succubus',name:'Súcubo',health:35,damage:'1d8',difficulty:14,armor:0,speed:14,icon:'😈',loot:[40,75],drops:[{itemId:'plg_demon_horn',chance:30},{itemId:'plg_shadow',chance:40}],regions:['plg_catacumbas'],canGroup:false},
        {id:'plg_naga',name:'Naga',health:45,damage:'2d6',difficulty:15,armor:3,speed:12,icon:'🐍',effect:'poison',loot:[45,85],drops:[{itemId:'plg_scale',chance:60},{itemId:'plg_venom',chance:40}],regions:['plg_abismo'],canGroup:false},
        {id:'plg_beholder',name:'Contemplador',health:45,damage:'2d6',difficulty:16,armor:2,speed:10,icon:'👁️',usesMana:true,loot:[50,90],drops:[{itemId:'plg_eye',chance:60},{itemId:'plg_crystal',chance:30}],regions:['mazmorra'],canGroup:false},
        {id:'plg_death_knight',name:'Cab. Muerte',health:50,damage:'2d8',difficulty:16,armor:5,speed:10,icon:'⚔️',loot:[60,110],drops:[{itemId:'plg_shadow',chance:50},{itemId:'plg_bone',chance:40},{itemId:'plg_iron',chance:30}],regions:['plg_catacumbas'],canGroup:false}
    ];
    enemies.forEach(function(e) { e.fromPlugin = true; Data.enemies.push(e); });

    // ═══════════════════════════════════════════════════════════════
    // MASCOTAS (12)
    // ═══════════════════════════════════════════════════════════════
    var pets = [
        {id:'plg_pet_cat',name:'Gato',health:12,damage:'1d4',speed:16,difficulty:18,icon:'🐱',regions:['pueblo','bosque']},
        {id:'plg_pet_dog',name:'Perro',health:18,damage:'1d6',speed:14,difficulty:16,icon:'🐕',regions:['pueblo','camino']},
        {id:'plg_pet_hawk',name:'Halcón',health:10,damage:'1d6',speed:20,difficulty:22,icon:'🦅',regions:['montana']},
        {id:'plg_pet_snake',name:'Serpiente',health:8,damage:'1d4',speed:12,difficulty:20,icon:'🐍',regions:['pantano']},
        {id:'plg_pet_spider',name:'Araña',health:15,damage:'1d6',speed:14,difficulty:24,icon:'🕷️',regions:['mazmorra']},
        {id:'plg_pet_bat',name:'Murciélago',health:8,damage:'1d4',speed:18,difficulty:16,icon:'🦇',regions:['mazmorra']},
        {id:'plg_pet_fox',name:'Zorro',health:14,damage:'1d4',speed:17,difficulty:20,icon:'🦊',regions:['bosque']},
        {id:'plg_pet_owl',name:'Búho',health:10,damage:'1d4',speed:15,difficulty:22,icon:'🦉',regions:['bosque']},
        {id:'plg_pet_boar',name:'Jabalí',health:25,damage:'1d8',speed:11,difficulty:26,icon:'🐗',regions:['bosque']},
        {id:'plg_pet_turtle',name:'Tortuga',health:30,damage:'1d2',speed:6,difficulty:20,icon:'🐢',regions:['pantano']},
        {id:'plg_pet_raven',name:'Cuervo',health:8,damage:'1d4',speed:16,difficulty:18,icon:'🐦‍⬛',regions:['plg_cementerio']},
        {id:'plg_pet_phoenix',name:'Fénix Bebé',health:20,damage:'1d10',speed:18,difficulty:30,icon:'🔥',regions:['plg_volcan']}
    ];
    pets.forEach(function(p) { p.fromPlugin = true; Data.pets.push(p); });

    // ═══════════════════════════════════════════════════════════════
    // HECHIZOS (15)
    // ═══════════════════════════════════════════════════════════════
    var spells = [
        {id:'plg_sp_fireball',name:'Bola Fuego',damage:'2d6',cost:4,icon:'🔥',effect:'fire'},
        {id:'plg_sp_inferno',name:'Infierno',damage:'2d8',cost:8,icon:'🔥',effect:'fire'},
        {id:'plg_sp_meteor',name:'Meteoro',damage:'3d6',cost:10,icon:'☄️',effect:'fire'},
        {id:'plg_sp_ice_ray',name:'Rayo Hielo',damage:'1d8',cost:4,icon:'❄️',effect:'ice'},
        {id:'plg_sp_blizzard',name:'Ventisca',damage:'2d4',cost:6,icon:'🌨️',effect:'ice'},
        {id:'plg_sp_lightning',name:'Relámpago',damage:'2d6',cost:5,icon:'⚡'},
        {id:'plg_sp_thunder',name:'Trueno',damage:'3d6',cost:8,icon:'⚡'},
        {id:'plg_sp_heal',name:'Curar',damage:'0',cost:4,icon:'💚',healAmount:'2d6'},
        {id:'plg_sp_heal_greater',name:'Curación Mayor',damage:'0',cost:6,icon:'💚',healAmount:'3d6'},
        {id:'plg_sp_drain',name:'Drenar Vida',damage:'1d6',cost:4,icon:'💜'},
        {id:'plg_sp_shadow_bolt',name:'Rayo Oscuro',damage:'2d8',cost:6,icon:'🌑'},
        {id:'plg_sp_shield',name:'Escudo',damage:'0',cost:3,icon:'🛡️'},
        {id:'plg_sp_haste',name:'Prisa',damage:'0',cost:3,icon:'💨'},
        {id:'plg_sp_strength',name:'Fuerza',damage:'0',cost:4,icon:'💪'},
        {id:'plg_sp_arcane',name:'Misil Arcano',damage:'1d10',cost:3,icon:'✨'}
    ];
    if (!Data.spells) Data.spells = [];
    spells.forEach(function(s) { s.fromPlugin = true; Data.spells.push(s); });

    // ═══════════════════════════════════════════════════════════════
    // RECETAS DE CRAFTEO (60+)
    // ═══════════════════════════════════════════════════════════════
    if (!Data.recipes) Data.recipes = [];
    var recipes = [
        // === POCIONES ===
        {id:'plg_rec_hp_minor',name:'Poción HP Menor',icon:'🧪',result:'plg_pot_hp_minor',ingredients:[{id:'plg_herb_heal',qty:2},{id:'plg_flask_empty',qty:1}]},
        {id:'plg_rec_hp',name:'Poción HP',icon:'🧪',result:'plg_pot_hp',ingredients:[{id:'plg_herb_heal',qty:4},{id:'plg_flask_empty',qty:1}]},
        {id:'plg_rec_hp_major',name:'Poción HP Mayor',icon:'🧪',result:'plg_pot_hp_major',ingredients:[{id:'plg_herb_heal',qty:5},{id:'plg_herb_rare',qty:2},{id:'plg_flask_empty',qty:1}]},
        {id:'plg_rec_mana_minor',name:'Poción Maná Menor',icon:'🧪',result:'plg_pot_mana_minor',ingredients:[{id:'plg_herb_mana',qty:2},{id:'plg_flask_empty',qty:1}]},
        {id:'plg_rec_mana',name:'Poción Maná',icon:'🧪',result:'plg_pot_mana',ingredients:[{id:'plg_herb_mana',qty:4},{id:'plg_flask_empty',qty:1}]},
        {id:'plg_rec_mana_major',name:'Poción Maná Mayor',icon:'🧪',result:'plg_pot_mana_major',ingredients:[{id:'plg_herb_mana',qty:5},{id:'plg_herb_rare',qty:2},{id:'plg_flask_empty',qty:1}]},
        {id:'plg_rec_antidote',name:'Antídoto',icon:'💊',result:'plg_antidote',ingredients:[{id:'plg_herb_heal',qty:1},{id:'plg_venom',qty:1},{id:'plg_flask_empty',qty:1}]},
        {id:'plg_rec_strength',name:'Poción Fuerza',icon:'💪',result:'plg_pot_strength',ingredients:[{id:'plg_troll_blood',qty:1},{id:'plg_herb_rare',qty:2},{id:'plg_flask_empty',qty:1}]},
        {id:'plg_rec_speed',name:'Poción Velocidad',icon:'💨',result:'plg_pot_speed',ingredients:[{id:'plg_feather',qty:3},{id:'plg_herb_rare',qty:1},{id:'plg_flask_empty',qty:1}]},
        {id:'plg_rec_fire_res',name:'Resist. Fuego',icon:'🔥',result:'plg_pot_fire_res',ingredients:[{id:'plg_ember',qty:2},{id:'plg_flask_empty',qty:1}]},
        {id:'plg_rec_ice_res',name:'Resist. Hielo',icon:'❄️',result:'plg_pot_ice_res',ingredients:[{id:'plg_frost',qty:2},{id:'plg_flask_empty',qty:1}]},
        {id:'plg_rec_regen',name:'Poción Regeneración',icon:'💚',result:'plg_pot_regen',ingredients:[{id:'plg_troll_blood',qty:2},{id:'plg_herb_rare',qty:3},{id:'plg_flask_empty',qty:1}]},
        {id:'plg_rec_elixir',name:'Elixir de Vida',icon:'⭐',result:'plg_elixir',ingredients:[{id:'plg_phoenix_ash',qty:1},{id:'plg_unicorn_horn',qty:1},{id:'plg_flask_empty',qty:1}]},
        // === MATERIALES ===
        {id:'plg_rec_steel',name:'Acero',icon:'⬜',result:'plg_steel',ingredients:[{id:'plg_iron',qty:2},{id:'plg_coal',qty:1}]},
        {id:'plg_rec_bronze',name:'Bronce',icon:'🟫',result:'plg_bronze',ingredients:[{id:'plg_copper',qty:2},{id:'plg_tin',qty:1}]},
        {id:'plg_rec_thick_leather',name:'Cuero Grueso',icon:'🟫',result:'plg_thick_leather',ingredients:[{id:'plg_leather',qty:3}]},
        {id:'plg_rec_enchant',name:'Polvo Encantamiento',icon:'✨',result:'plg_enchant_dust',ingredients:[{id:'plg_crystal',qty:2},{id:'plg_magic_essence',qty:1}]},
        // === ARMAS BÁSICAS ===
        {id:'plg_rec_dagger',name:'Daga',icon:'🗡️',result:'plg_wpn_dagger',ingredients:[{id:'plg_iron',qty:2},{id:'plg_wood',qty:1}]},
        {id:'plg_rec_short',name:'Espada Corta',icon:'🗡️',result:'plg_wpn_short',ingredients:[{id:'plg_iron',qty:4},{id:'plg_leather',qty:1}]},
        {id:'plg_rec_long',name:'Espada Larga',icon:'⚔️',result:'plg_wpn_long',ingredients:[{id:'plg_steel',qty:4},{id:'plg_leather',qty:2}]},
        {id:'plg_rec_great',name:'Mandoble',icon:'⚔️',result:'plg_wpn_great',ingredients:[{id:'plg_steel',qty:8},{id:'plg_leather',qty:2}]},
        {id:'plg_rec_axe',name:'Hacha Batalla',icon:'🪓',result:'plg_wpn_axe',ingredients:[{id:'plg_steel',qty:5},{id:'plg_wood',qty:2}]},
        {id:'plg_rec_mace',name:'Maza',icon:'⚒️',result:'plg_wpn_mace',ingredients:[{id:'plg_iron',qty:5},{id:'plg_wood',qty:1}]},
        {id:'plg_rec_spear',name:'Lanza',icon:'🔱',result:'plg_wpn_spear',ingredients:[{id:'plg_iron',qty:2},{id:'plg_wood',qty:4}]},
        {id:'plg_rec_bow',name:'Arco Largo',icon:'🏹',result:'plg_wpn_bow',ingredients:[{id:'plg_hardwood',qty:3},{id:'plg_silk',qty:2}]},
        // === ARMAS MEJORADAS ===
        {id:'plg_rec_katana',name:'Katana',icon:'⚔️',result:'plg_wpn_katana',ingredients:[{id:'plg_steel',qty:6},{id:'plg_coal',qty:4},{id:'plg_silver',qty:2}]},
        {id:'plg_rec_claymore',name:'Claymore',icon:'⚔️',result:'plg_wpn_claymore',ingredients:[{id:'plg_steel',qty:10},{id:'plg_leather',qty:3}]},
        {id:'plg_rec_mithril_sword',name:'Espada Mithril',icon:'✨',result:'plg_wpn_zweihander',ingredients:[{id:'plg_mithril',qty:8},{id:'plg_leather',qty:2}]},
        {id:'plg_rec_dragon_slayer',name:'Matadragones',icon:'🐲',result:'plg_wpn_dragon_slayer',ingredients:[{id:'plg_dragon_scale',qty:10},{id:'plg_dragon_blood',qty:3},{id:'plg_adamantine',qty:5}]},
        // === BASTONES ===
        {id:'plg_rec_wand',name:'Varita',icon:'✨',result:'plg_wpn_wand',ingredients:[{id:'plg_wood',qty:2},{id:'plg_crystal',qty:1}]},
        {id:'plg_rec_staff',name:'Bastón',icon:'🪄',result:'plg_wpn_staff',ingredients:[{id:'plg_hardwood',qty:3},{id:'plg_crystal',qty:2}]},
        {id:'plg_rec_staff_fire',name:'Bastón Fuego',icon:'🔥',result:'plg_wpn_staff_fire',ingredients:[{id:'plg_hardwood',qty:3},{id:'plg_ember',qty:3},{id:'plg_ruby',qty:1}]},
        {id:'plg_rec_staff_ice',name:'Bastón Hielo',icon:'❄️',result:'plg_wpn_staff_ice',ingredients:[{id:'plg_hardwood',qty:3},{id:'plg_frost',qty:3},{id:'plg_sapphire',qty:1}]},
        {id:'plg_rec_staff_thunder',name:'Bastón Trueno',icon:'⚡',result:'plg_wpn_staff_thunder',ingredients:[{id:'plg_hardwood',qty:3},{id:'plg_spark',qty:3},{id:'plg_topaz',qty:1}]},
        {id:'plg_rec_staff_arcane',name:'Bastón Arcano',icon:'🔮',result:'plg_wpn_staff_arcane',ingredients:[{id:'plg_mithril',qty:3},{id:'plg_crystal',qty:5},{id:'plg_magic_essence',qty:2},{id:'plg_diamond',qty:1}]},
        {id:'plg_rec_grimoire',name:'Grimorio',icon:'📕',result:'plg_wpn_grimoire',ingredients:[{id:'plg_book_empty',qty:1},{id:'plg_shadow',qty:3},{id:'plg_crystal',qty:2}]},
        // === ARMADURAS ===
        {id:'plg_rec_leather',name:'Armadura Cuero',icon:'🦺',result:'plg_arm_leather',ingredients:[{id:'plg_leather',qty:6}]},
        {id:'plg_rec_studded',name:'Armadura Tachonada',icon:'🦺',result:'plg_arm_studded',ingredients:[{id:'plg_leather',qty:6},{id:'plg_iron',qty:4}]},
        {id:'plg_rec_chain',name:'Cota Malla',icon:'⛓️',result:'plg_arm_chain',ingredients:[{id:'plg_iron',qty:12}]},
        {id:'plg_rec_scale',name:'Armadura Escamas',icon:'🐉',result:'plg_arm_scale',ingredients:[{id:'plg_scale',qty:15},{id:'plg_leather',qty:4}]},
        {id:'plg_rec_plate',name:'Armadura Placas',icon:'🛡️',result:'plg_arm_plate',ingredients:[{id:'plg_steel',qty:15},{id:'plg_leather',qty:5}]},
        {id:'plg_rec_mithril_arm',name:'Armadura Mithril',icon:'✨',result:'plg_arm_mithril',ingredients:[{id:'plg_mithril',qty:12},{id:'plg_leather',qty:4}]},
        {id:'plg_rec_dragon_arm',name:'Armadura Dragón',icon:'🐲',result:'plg_arm_dragon',ingredients:[{id:'plg_dragon_scale',qty:20},{id:'plg_dragon_blood',qty:3},{id:'plg_mithril',qty:5}]},
        {id:'plg_rec_adamant_arm',name:'Armadura Adamantina',icon:'💎',result:'plg_arm_adamant',ingredients:[{id:'plg_adamantine',qty:15},{id:'plg_dragon_blood',qty:2}]},
        // === TÚNICAS ===
        {id:'plg_rec_mage_robe',name:'Túnica Mago',icon:'🧥',result:'plg_arm_mage',ingredients:[{id:'plg_cloth',qty:6},{id:'plg_silk',qty:4}]},
        {id:'plg_rec_archmage_robe',name:'Túnica Archimago',icon:'🧙',result:'plg_arm_archmage',ingredients:[{id:'plg_silk',qty:8},{id:'plg_crystal',qty:3},{id:'plg_shadow',qty:2}]},
        {id:'plg_rec_celestial',name:'Manto Celestial',icon:'👼',result:'plg_arm_celestial',ingredients:[{id:'plg_silk',qty:10},{id:'plg_phoenix_ash',qty:2},{id:'plg_angel_feather',qty:3},{id:'plg_diamond',qty:1}]},
        // === ACCESORIOS ===
        {id:'plg_rec_speed_boots',name:'Botas Velocidad',icon:'👢',result:'plg_acc_speed',ingredients:[{id:'plg_leather',qty:4},{id:'plg_feather',qty:5},{id:'plg_enchant_dust',qty:1}]},
        {id:'plg_rec_regen_orb',name:'Orbe Regeneración',icon:'🔮',result:'plg_acc_regen',ingredients:[{id:'plg_crystal',qty:3},{id:'plg_troll_blood',qty:3},{id:'plg_herb_rare',qty:4}]},
        {id:'plg_rec_crit_ring',name:'Anillo Crítico',icon:'💍',result:'plg_acc_crit',ingredients:[{id:'plg_ring_base',qty:1},{id:'plg_gold',qty:2},{id:'plg_ruby',qty:1}]},
        {id:'plg_rec_vamp_amulet',name:'Amuleto Vampírico',icon:'🩸',result:'plg_acc_lifesteal',ingredients:[{id:'plg_amulet_base',qty:1},{id:'plg_vampire_fang',qty:3},{id:'plg_shadow',qty:2},{id:'plg_ruby',qty:1}]},
        {id:'plg_rec_mana_gem',name:'Gema Maná',icon:'💙',result:'plg_acc_mana',ingredients:[{id:'plg_ring_base',qty:1},{id:'plg_sapphire',qty:2},{id:'plg_crystal',qty:2}]},
        {id:'plg_rec_fire_immune',name:'Rubí Fénix',icon:'🔴',result:'plg_acc_fire_immune',ingredients:[{id:'plg_amulet_base',qty:1},{id:'plg_phoenix_ash',qty:2},{id:'plg_ruby',qty:2}]},
        {id:'plg_rec_ice_immune',name:'Zafiro Glacial',icon:'🔵',result:'plg_acc_ice_immune',ingredients:[{id:'plg_amulet_base',qty:1},{id:'plg_frost',qty:3},{id:'plg_sapphire',qty:2}]},
        {id:'plg_rec_survivor',name:'Amuleto Superviviente',icon:'💚',result:'plg_acc_survivor',ingredients:[{id:'plg_amulet_base',qty:1},{id:'plg_phoenix_ash',qty:3},{id:'plg_heart',qty:2},{id:'plg_diamond',qty:1}]},
        // === PERGAMINOS ===
        {id:'plg_rec_scroll_fire',name:'Perg: Bola Fuego',icon:'📜',result:'plg_scroll_fireball',ingredients:[{id:'plg_scroll_blank',qty:1},{id:'plg_ember',qty:2}]},
        {id:'plg_rec_scroll_ice',name:'Perg: Rayo Hielo',icon:'📜',result:'plg_scroll_ice_ray',ingredients:[{id:'plg_scroll_blank',qty:1},{id:'plg_frost',qty:2}]},
        {id:'plg_rec_scroll_heal',name:'Perg: Curar',icon:'📜',result:'plg_scroll_heal',ingredients:[{id:'plg_scroll_blank',qty:1},{id:'plg_herb_heal',qty:4}]},
        {id:'plg_rec_scroll_lightning',name:'Perg: Relámpago',icon:'📜',result:'plg_scroll_lightning',ingredients:[{id:'plg_scroll_blank',qty:1},{id:'plg_spark',qty:2}]},
        // === COMIDAS ===
        {id:'plg_rec_stew',name:'Estofado',icon:'🍲',result:'plg_food_stew',ingredients:[{id:'plg_food_meat',qty:2},{id:'plg_food_potato',qty:2},{id:'plg_food_carrot',qty:2}]},
        {id:'plg_rec_pie',name:'Pastel',icon:'🥧',result:'plg_food_pie',ingredients:[{id:'plg_food_apple',qty:4},{id:'plg_food_honey',qty:1}]},
        {id:'plg_rec_feast',name:'Festín Real',icon:'👑',result:'plg_food_feast',ingredients:[{id:'plg_food_steak',qty:2},{id:'plg_food_wine',qty:1},{id:'plg_food_cake',qty:1}]},
        {id:'plg_rec_elf_bread',name:'Pan Élfico',icon:'🧝',result:'plg_food_elf_bread',ingredients:[{id:'plg_food_bread',qty:3},{id:'plg_herb_rare',qty:2},{id:'plg_food_honey',qty:2}]}
    ];
    recipes.forEach(function(r) { r.fromPlugin = true; Data.recipes.push(r); });

    // Aplicar sprites personalizados
    if (Data.pluginSprites && typeof Data.pluginSprites === 'object') {
        var sprites = Data.pluginSprites;
        ['weapons','armors','items','enemies','pets','regions','spells'].forEach(function(key) {
            (Data[key] || []).forEach(function(item) {
                if (item.id && sprites[item.id]) item.sprite = sprites[item.id];
            });
        });
    }

    // Aplicar modificaciones de usuario a items del plugin
    if (typeof Data.applyPluginMods === 'function') {
        Data.applyPluginMods();
    }

    console.log('📦 Plugin v18 completo!');
    if (typeof Editor !== 'undefined' && Editor.renderAll) {
        setTimeout(function() { Editor.renderAll(); Editor.updateSelects(); }, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPluginItems);
} else {
    loadPluginItems();
}
console.log('🎮 RPG Plugins v18');
