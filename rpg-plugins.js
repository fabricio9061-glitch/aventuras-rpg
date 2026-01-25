/**
 * RPG Plugins System v16 - Mega Expansion
 * 
 * Todos los IDs usan prefijo 'plg_' - protegidos de Firebase
 * Los sprites personalizados se guardan en Data.pluginSprites
 * 
 * Contenido:
 * - 5 regiones
 * - 35+ enemigos
 * - 12 mascotas
 * - 25 armas
 * - 12 armaduras
 * - 150+ items/materiales
 * - 50 comidas
 * - 50 pergaminos de hechizos
 * - 20 accesorios especiales
 * - 15 hechizos
 */

var Plugins = {
    registry: [],
    specialItems: {},
    customEffects: {},
    
    register: function(plugin) {
        if (!plugin.id) return;
        this.registry.push(plugin);
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
    isPluginId: function(id) { return id && id.toString().startsWith('plg_'); },
    
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

// Efectos
Plugins.registerEffect({ id: 'ice', name: 'Hielo', icon: '❄️', freezeChance: 0.30 });
Plugins.registerEffect({ id: 'fury', name: 'Furia', icon: '🔥' });
Plugins.registerEffect({ id: 'shield', name: 'Escudo', icon: '🛡️' });

// ═══════════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

function loadPluginItems() {
    if (typeof Data === 'undefined') {
        setTimeout(loadPluginItems, 100);
        return;
    }
    
    console.log('🔌 Cargando plugin v16...');
    
    // Limpiar items del plugin
    ['regions','enemies','pets','weapons','armors','items','spells'].forEach(function(key) {
        if (Data[key]) {
            Data[key] = Data[key].filter(function(item) {
                return !item.id || !item.id.toString().startsWith('plg_');
            });
        }
    });

    // ═══════════════════════════════════════════════════════════════
    // 5 REGIONES
    // ═══════════════════════════════════════════════════════════════
    
    var newRegions = [
        {id:'plg_catacumbas',name:'Catacumbas Olvidadas',icon:'💀',type:'danger',danger:4,
            encounters:['plg_skeleton','plg_ghost','plg_vampire','plg_necromancer','plg_lich'],
            desc:'Tumbas antiguas.',connections:['mazmorra']},
        {id:'plg_volcan',name:'Volcán Ardiente',icon:'🌋',type:'danger',danger:5,
            encounters:['plg_fire_elem','plg_salamander','plg_dragon_young','plg_lava_golem','plg_phoenix'],
            desc:'Calor mortal.',connections:['montana','desierto']},
        {id:'plg_abismo',name:'Abismo Marino',icon:'🌊',type:'danger',danger:4,
            encounters:['plg_crab','plg_shark','plg_kraken_tentacle','plg_mermaid','plg_sea_serpent'],
            desc:'Profundidades oceánicas.',connections:['pantano']},
        {id:'plg_torre',name:'Torre del Mago',icon:'🏰',type:'danger',danger:3,
            encounters:['plg_golem','plg_gargoyle','plg_imp','plg_wizard','plg_elemental'],
            desc:'Experimentos mágicos.',connections:['pueblo','bosque']},
        {id:'plg_cementerio',name:'Cementerio Maldito',icon:'🪦',type:'danger',danger:3,
            encounters:['plg_zombie','plg_skeleton','plg_ghost','plg_banshee','plg_ghoul'],
            desc:'Los muertos caminan.',connections:['pueblo','bosque']}
    ];
    
    newRegions.forEach(function(r) { r.fromPlugin = true; Data.regions.push(r); });

    // ═══════════════════════════════════════════════════════════════
    // 150+ ITEMS Y MATERIALES
    // ═══════════════════════════════════════════════════════════════
    
    var newItems = [
        // Materiales de monstruos (50)
        {id:'plg_silk',name:'Hilo de Araña',type:'misc',icon:'🕸️',value:8,rarity:'common',desc:'Seda resistente.'},
        {id:'plg_fang',name:'Colmillo',type:'misc',icon:'🦷',value:12,rarity:'common',desc:'Afilado.'},
        {id:'plg_scale',name:'Escama de Dragón',type:'misc',icon:'🐉',value:50,rarity:'epic',desc:'Brillante.'},
        {id:'plg_bone',name:'Hueso',type:'misc',icon:'🦴',value:5,rarity:'common',desc:'De criatura.'},
        {id:'plg_leather',name:'Cuero Crudo',type:'misc',icon:'🟫',value:10,rarity:'common',desc:'Sin curtir.'},
        {id:'plg_fur',name:'Piel de Oso',type:'misc',icon:'🧸',value:25,rarity:'rare',desc:'Gruesa.'},
        {id:'plg_claw',name:'Garra',type:'misc',icon:'🦎',value:30,rarity:'rare',desc:'Enorme.'},
        {id:'plg_eye',name:'Ojo Mágico',type:'misc',icon:'👁️',value:45,rarity:'epic',desc:'Con poder.'},
        {id:'plg_horn',name:'Cuerno',type:'misc',icon:'🐂',value:40,rarity:'rare',desc:'Macizo.'},
        {id:'plg_wing',name:'Ala de Murciélago',type:'misc',icon:'🦇',value:15,rarity:'common',desc:'Membrana.'},
        {id:'plg_slime',name:'Gelatina',type:'misc',icon:'🟢',value:6,rarity:'common',desc:'Viscosa.'},
        {id:'plg_venom',name:'Veneno',type:'misc',icon:'🐍',value:20,rarity:'rare',desc:'Mortal.'},
        {id:'plg_feather',name:'Pluma Dorada',type:'misc',icon:'🪶',value:35,rarity:'rare',desc:'Mágica.'},
        {id:'plg_pearl',name:'Perla Marina',type:'misc',icon:'🫧',value:55,rarity:'epic',desc:'Brillante.'},
        {id:'plg_crystal',name:'Cristal Mágico',type:'misc',icon:'💎',value:60,rarity:'epic',desc:'Arcano.'},
        {id:'plg_ember',name:'Brasa Elemental',type:'misc',icon:'🔥',value:40,rarity:'rare',desc:'Fuego eterno.'},
        {id:'plg_frost',name:'Esencia de Hielo',type:'misc',icon:'❄️',value:40,rarity:'rare',desc:'Frío eterno.'},
        {id:'plg_shadow',name:'Esencia Oscura',type:'misc',icon:'🌑',value:50,rarity:'epic',desc:'Sombra.'},
        {id:'plg_heart',name:'Corazón de Bestia',type:'misc',icon:'❤️',value:35,rarity:'rare',desc:'Latiente.'},
        {id:'plg_tooth',name:'Diente de Tiburón',type:'misc',icon:'🦈',value:18,rarity:'common',desc:'Serrado.'},
        {id:'plg_shell',name:'Caparazón',type:'misc',icon:'🐚',value:12,rarity:'common',desc:'Duro.'},
        {id:'plg_antenna',name:'Antena',type:'misc',icon:'🐜',value:8,rarity:'common',desc:'Sensor.'},
        {id:'plg_stinger',name:'Aguijón',type:'misc',icon:'🐝',value:15,rarity:'common',desc:'Venenoso.'},
        {id:'plg_mucus',name:'Mucosidad',type:'misc',icon:'💧',value:4,rarity:'common',desc:'Pegajosa.'},
        {id:'plg_tail',name:'Cola de Lagarto',type:'misc',icon:'🦎',value:10,rarity:'common',desc:'Regenera.'},
        {id:'plg_goblin_ear',name:'Oreja de Goblin',type:'misc',icon:'👂',value:7,rarity:'common',desc:'Trofeo.'},
        {id:'plg_wolf_pelt',name:'Piel de Lobo',type:'misc',icon:'🐺',value:20,rarity:'common',desc:'Gris.'},
        {id:'plg_spider_leg',name:'Pata de Araña',type:'misc',icon:'🦵',value:6,rarity:'common',desc:'Peluda.'},
        {id:'plg_rat_tail',name:'Cola de Rata',type:'misc',icon:'🐀',value:3,rarity:'common',desc:'Útil.'},
        {id:'plg_bat_fang',name:'Colmillo Murciélago',type:'misc',icon:'🦷',value:8,rarity:'common',desc:'Pequeño.'},
        {id:'plg_ectoplasm',name:'Ectoplasma',type:'misc',icon:'👻',value:30,rarity:'rare',desc:'Fantasmal.'},
        {id:'plg_zombie_flesh',name:'Carne Podrida',type:'misc',icon:'🧟',value:5,rarity:'common',desc:'Pestilente.'},
        {id:'plg_skull',name:'Cráneo',type:'misc',icon:'💀',value:15,rarity:'common',desc:'Macabro.'},
        {id:'plg_demon_horn',name:'Cuerno de Demonio',type:'misc',icon:'😈',value:70,rarity:'epic',desc:'Infernal.'},
        {id:'plg_angel_feather',name:'Pluma de Ángel',type:'misc',icon:'🪽',value:80,rarity:'legendary',desc:'Divina.'},
        {id:'plg_phoenix_ash',name:'Ceniza de Fénix',type:'misc',icon:'🔥',value:100,rarity:'legendary',desc:'Renace.'},
        {id:'plg_dragon_blood',name:'Sangre de Dragón',type:'misc',icon:'🩸',value:90,rarity:'legendary',desc:'Ancestral.'},
        {id:'plg_mermaid_scale',name:'Escama de Sirena',type:'misc',icon:'🧜',value:65,rarity:'epic',desc:'Brilla.'},
        {id:'plg_kraken_ink',name:'Tinta de Kraken',type:'misc',icon:'🦑',value:55,rarity:'epic',desc:'Oscura.'},
        {id:'plg_golem_core',name:'Núcleo de Golem',type:'misc',icon:'🤖',value:60,rarity:'epic',desc:'Animador.'},
        {id:'plg_troll_blood',name:'Sangre de Troll',type:'misc',icon:'🩸',value:35,rarity:'rare',desc:'Regenera.'},
        {id:'plg_harpy_talon',name:'Garra de Arpía',type:'misc',icon:'🦅',value:25,rarity:'rare',desc:'Curvada.'},
        {id:'plg_basilisk_eye',name:'Ojo de Basilisco',type:'misc',icon:'👁️',value:70,rarity:'epic',desc:'Petrifica.'},
        {id:'plg_manticore_spike',name:'Púa de Mantícora',type:'misc',icon:'🦂',value:45,rarity:'rare',desc:'Venenosa.'},
        {id:'plg_hydra_fang',name:'Colmillo de Hidra',type:'misc',icon:'🐍',value:80,rarity:'legendary',desc:'Regenera.'},
        {id:'plg_chimera_mane',name:'Melena de Quimera',type:'misc',icon:'🦁',value:65,rarity:'epic',desc:'Tricolor.'},
        {id:'plg_cerberus_fur',name:'Pelo de Cerbero',type:'misc',icon:'🐕',value:75,rarity:'epic',desc:'Infernal.'},
        {id:'plg_griffin_feather',name:'Pluma de Grifo',type:'misc',icon:'🦅',value:55,rarity:'epic',desc:'Majestuosa.'},
        {id:'plg_unicorn_horn',name:'Cuerno de Unicornio',type:'misc',icon:'🦄',value:120,rarity:'legendary',desc:'Puro.'},
        {id:'plg_werewolf_claw',name:'Garra de Licántropo',type:'misc',icon:'🐺',value:40,rarity:'rare',desc:'Maldita.'},
        
        // Gemas (10)
        {id:'plg_ruby',name:'Rubí',type:'misc',icon:'🔴',value:80,rarity:'epic',desc:'Roja.'},
        {id:'plg_sapphire',name:'Zafiro',type:'misc',icon:'🔵',value:80,rarity:'epic',desc:'Azul.'},
        {id:'plg_emerald',name:'Esmeralda',type:'misc',icon:'🟢',value:80,rarity:'epic',desc:'Verde.'},
        {id:'plg_diamond',name:'Diamante',type:'misc',icon:'💠',value:150,rarity:'legendary',desc:'Puro.'},
        {id:'plg_amethyst',name:'Amatista',type:'misc',icon:'🟣',value:60,rarity:'rare',desc:'Púrpura.'},
        {id:'plg_topaz',name:'Topacio',type:'misc',icon:'🟡',value:60,rarity:'rare',desc:'Amarillo.'},
        {id:'plg_opal',name:'Ópalo',type:'misc',icon:'⚪',value:70,rarity:'epic',desc:'Iridiscente.'},
        {id:'plg_onyx',name:'Ónix',type:'misc',icon:'⚫',value:70,rarity:'epic',desc:'Negro.'},
        {id:'plg_jade',name:'Jade',type:'misc',icon:'💚',value:65,rarity:'rare',desc:'Oriental.'},
        {id:'plg_moonstone',name:'Piedra Lunar',type:'misc',icon:'🌙',value:75,rarity:'epic',desc:'Mística.'},
        
        // Minerales (8)
        {id:'plg_iron',name:'Hierro',type:'misc',icon:'🪨',value:15,rarity:'common',desc:'Común.'},
        {id:'plg_gold',name:'Oro',type:'misc',icon:'🥇',value:50,rarity:'rare',desc:'Puro.'},
        {id:'plg_silver',name:'Plata',type:'misc',icon:'🥈',value:30,rarity:'rare',desc:'Precioso.'},
        {id:'plg_mithril',name:'Mithril',type:'misc',icon:'✨',value:100,rarity:'epic',desc:'Élfico.'},
        {id:'plg_adamantine',name:'Adamantina',type:'misc',icon:'💎',value:120,rarity:'legendary',desc:'Indestructible.'},
        {id:'plg_copper',name:'Cobre',type:'misc',icon:'🟤',value:8,rarity:'common',desc:'Conductor.'},
        {id:'plg_tin',name:'Estaño',type:'misc',icon:'⬜',value:10,rarity:'common',desc:'Maleable.'},
        {id:'plg_platinum',name:'Platino',type:'misc',icon:'⬛',value:90,rarity:'epic',desc:'Noble.'},
        
        // Hierbas (10)
        {id:'plg_herb_heal',name:'Hierba Curativa',type:'misc',icon:'🌿',value:10,rarity:'common',desc:'Medicinal.'},
        {id:'plg_herb_mana',name:'Flor de Maná',type:'misc',icon:'🌸',value:15,rarity:'common',desc:'Energía.'},
        {id:'plg_herb_poison',name:'Belladona',type:'misc',icon:'🍇',value:12,rarity:'common',desc:'Tóxica.'},
        {id:'plg_herb_rare',name:'Raíz Arcana',type:'misc',icon:'🌱',value:40,rarity:'rare',desc:'Rara.'},
        {id:'plg_mushroom_red',name:'Hongo Rojo',type:'misc',icon:'🍄',value:8,rarity:'common',desc:'¿Comestible?'},
        {id:'plg_mushroom_blue',name:'Hongo Azul',type:'misc',icon:'🍄',value:25,rarity:'rare',desc:'Mágico.'},
        {id:'plg_lotus',name:'Loto Negro',type:'misc',icon:'🪷',value:50,rarity:'epic',desc:'Muerte.'},
        {id:'plg_mandrake',name:'Mandrágora',type:'misc',icon:'🥕',value:45,rarity:'rare',desc:'Grita.'},
        {id:'plg_wolfsbane',name:'Acónito',type:'misc',icon:'💜',value:35,rarity:'rare',desc:'Anti-licántropos.'},
        {id:'plg_nightshade',name:'Solanácea',type:'misc',icon:'🖤',value:30,rarity:'rare',desc:'Sombría.'},
        
        // Objetos varios (20)
        {id:'plg_key_gold',name:'Llave Dorada',type:'misc',icon:'🗝️',value:30,rarity:'rare',desc:'Especial.'},
        {id:'plg_map',name:'Mapa del Tesoro',type:'misc',icon:'🗺️',value:40,rarity:'rare',desc:'X marca.'},
        {id:'plg_coin_ancient',name:'Moneda Antigua',type:'misc',icon:'🪙',value:25,rarity:'rare',desc:'Coleccionable.'},
        {id:'plg_book_spell',name:'Tomo Arcano',type:'misc',icon:'📕',value:60,rarity:'epic',desc:'Conocimiento.'},
        {id:'plg_scroll',name:'Pergamino',type:'misc',icon:'📜',value:15,rarity:'common',desc:'En blanco.'},
        {id:'plg_rope',name:'Cuerda',type:'misc',icon:'🪢',value:8,rarity:'common',desc:'Útil.'},
        {id:'plg_torch',name:'Antorcha',type:'misc',icon:'🔦',value:5,rarity:'common',desc:'Luz.'},
        {id:'plg_lantern',name:'Linterna',type:'misc',icon:'🏮',value:20,rarity:'common',desc:'Duradera.'},
        {id:'plg_compass',name:'Brújula',type:'misc',icon:'🧭',value:30,rarity:'rare',desc:'Orienta.'},
        {id:'plg_mirror',name:'Espejo Mágico',type:'misc',icon:'🪞',value:45,rarity:'rare',desc:'Refleja.'},
        {id:'plg_hourglass',name:'Reloj de Arena',type:'misc',icon:'⏳',value:35,rarity:'rare',desc:'Tiempo.'},
        {id:'plg_lockpick',name:'Ganzúa',type:'misc',icon:'🔧',value:15,rarity:'common',desc:'Abre.'},
        {id:'plg_bandage',name:'Vendaje',type:'misc',icon:'🩹',value:5,rarity:'common',desc:'Cura.'},
        {id:'plg_rope_silk',name:'Cuerda de Seda',type:'misc',icon:'🧵',value:25,rarity:'rare',desc:'Resistente.'},
        {id:'plg_tent',name:'Tienda',type:'misc',icon:'⛺',value:40,rarity:'rare',desc:'Descanso.'},
        {id:'plg_flask',name:'Frasco Vacío',type:'misc',icon:'🧴',value:5,rarity:'common',desc:'Para pociones.'},
        {id:'plg_mortar',name:'Mortero',type:'misc',icon:'🥣',value:15,rarity:'common',desc:'Alquimia.'},
        {id:'plg_quill',name:'Pluma y Tinta',type:'misc',icon:'🖊️',value:10,rarity:'common',desc:'Escribe.'},
        {id:'plg_chain',name:'Cadena',type:'misc',icon:'⛓️',value:20,rarity:'common',desc:'Resistente.'},
        {id:'plg_bell',name:'Campana',type:'misc',icon:'🔔',value:12,rarity:'common',desc:'Alerta.'}
    ];
    
    newItems.forEach(function(i) { i.fromPlugin = true; Data.items.push(i); });

    // ═══════════════════════════════════════════════════════════════
    // 50 COMIDAS
    // ═══════════════════════════════════════════════════════════════
    
    var newFoods = [
        {id:'plg_food_bread',name:'Pan',type:'food',icon:'🍞',value:5,rarity:'common',foodValue:3,desc:'Fresco.'},
        {id:'plg_food_cheese',name:'Queso',type:'food',icon:'🧀',value:8,rarity:'common',foodValue:4,desc:'Curado.'},
        {id:'plg_food_apple',name:'Manzana',type:'food',icon:'🍎',value:3,rarity:'common',foodValue:2,desc:'Fresca.'},
        {id:'plg_food_fish',name:'Pescado Asado',type:'food',icon:'🐟',value:10,rarity:'common',foodValue:5,desc:'Cocinado.'},
        {id:'plg_food_stew',name:'Estofado',type:'food',icon:'🍲',value:20,rarity:'rare',foodValue:8,desc:'Nutritivo.'},
        {id:'plg_food_meat',name:'Carne Asada',type:'food',icon:'🍖',value:12,rarity:'common',foodValue:6,desc:'Jugosa.'},
        {id:'plg_food_pie',name:'Pastel',type:'food',icon:'🥧',value:15,rarity:'rare',foodValue:7,desc:'Delicioso.'},
        {id:'plg_food_honey',name:'Miel',type:'food',icon:'🍯',value:18,rarity:'rare',foodValue:5,desc:'Dulce.'},
        {id:'plg_food_wine',name:'Vino',type:'food',icon:'🍷',value:25,rarity:'rare',foodValue:4,desc:'Añejo.'},
        {id:'plg_food_soup',name:'Sopa Caliente',type:'food',icon:'🍜',value:8,rarity:'common',foodValue:4,desc:'Reconfortante.'},
        {id:'plg_food_chicken',name:'Pollo Asado',type:'food',icon:'🍗',value:14,rarity:'common',foodValue:6,desc:'Crujiente.'},
        {id:'plg_food_egg',name:'Huevos Fritos',type:'food',icon:'🍳',value:6,rarity:'common',foodValue:3,desc:'Nutritivos.'},
        {id:'plg_food_cake',name:'Pastel de Chocolate',type:'food',icon:'🎂',value:22,rarity:'rare',foodValue:6,desc:'Celebración.'},
        {id:'plg_food_cookie',name:'Galletas',type:'food',icon:'🍪',value:4,rarity:'common',foodValue:2,desc:'Caseras.'},
        {id:'plg_food_grapes',name:'Uvas',type:'food',icon:'🍇',value:5,rarity:'common',foodValue:2,desc:'Frescas.'},
        {id:'plg_food_watermelon',name:'Sandía',type:'food',icon:'🍉',value:7,rarity:'common',foodValue:3,desc:'Refrescante.'},
        {id:'plg_food_orange',name:'Naranja',type:'food',icon:'🍊',value:4,rarity:'common',foodValue:2,desc:'Cítrica.'},
        {id:'plg_food_banana',name:'Plátano',type:'food',icon:'🍌',value:4,rarity:'common',foodValue:2,desc:'Energético.'},
        {id:'plg_food_strawberry',name:'Fresas',type:'food',icon:'🍓',value:6,rarity:'common',foodValue:2,desc:'Dulces.'},
        {id:'plg_food_peach',name:'Durazno',type:'food',icon:'🍑',value:5,rarity:'common',foodValue:2,desc:'Jugoso.'},
        {id:'plg_food_cherry',name:'Cerezas',type:'food',icon:'🍒',value:6,rarity:'common',foodValue:2,desc:'Rojas.'},
        {id:'plg_food_corn',name:'Maíz Asado',type:'food',icon:'🌽',value:5,rarity:'common',foodValue:3,desc:'Dorado.'},
        {id:'plg_food_carrot',name:'Zanahoria',type:'food',icon:'🥕',value:3,rarity:'common',foodValue:2,desc:'Crujiente.'},
        {id:'plg_food_potato',name:'Papa Asada',type:'food',icon:'🥔',value:5,rarity:'common',foodValue:3,desc:'Rellena.'},
        {id:'plg_food_onion',name:'Cebolla',type:'food',icon:'🧅',value:2,rarity:'common',foodValue:1,desc:'Picante.'},
        {id:'plg_food_tomato',name:'Tomate',type:'food',icon:'🍅',value:3,rarity:'common',foodValue:2,desc:'Maduro.'},
        {id:'plg_food_mushroom',name:'Champiñones',type:'food',icon:'🍄',value:6,rarity:'common',foodValue:2,desc:'Salteados.'},
        {id:'plg_food_rice',name:'Arroz',type:'food',icon:'🍚',value:5,rarity:'common',foodValue:4,desc:'Básico.'},
        {id:'plg_food_noodles',name:'Fideos',type:'food',icon:'🍝',value:10,rarity:'common',foodValue:5,desc:'Con salsa.'},
        {id:'plg_food_pizza',name:'Pizza',type:'food',icon:'🍕',value:12,rarity:'common',foodValue:5,desc:'Deliciosa.'},
        {id:'plg_food_burger',name:'Hamburguesa',type:'food',icon:'🍔',value:14,rarity:'common',foodValue:6,desc:'Completa.'},
        {id:'plg_food_hotdog',name:'Salchicha',type:'food',icon:'🌭',value:8,rarity:'common',foodValue:4,desc:'Con pan.'},
        {id:'plg_food_taco',name:'Taco',type:'food',icon:'🌮',value:9,rarity:'common',foodValue:4,desc:'Picante.'},
        {id:'plg_food_burrito',name:'Burrito',type:'food',icon:'🌯',value:11,rarity:'common',foodValue:5,desc:'Grande.'},
        {id:'plg_food_sushi',name:'Sushi',type:'food',icon:'🍣',value:18,rarity:'rare',foodValue:4,desc:'Exótico.'},
        {id:'plg_food_dumpling',name:'Dumpling',type:'food',icon:'🥟',value:10,rarity:'common',foodValue:4,desc:'Al vapor.'},
        {id:'plg_food_croissant',name:'Croissant',type:'food',icon:'🥐',value:8,rarity:'common',foodValue:3,desc:'Francés.'},
        {id:'plg_food_pretzel',name:'Pretzel',type:'food',icon:'🥨',value:6,rarity:'common',foodValue:2,desc:'Salado.'},
        {id:'plg_food_bacon',name:'Tocino',type:'food',icon:'🥓',value:10,rarity:'common',foodValue:4,desc:'Crujiente.'},
        {id:'plg_food_steak',name:'Filete',type:'food',icon:'🥩',value:25,rarity:'rare',foodValue:8,desc:'Jugoso.'},
        {id:'plg_food_salad',name:'Ensalada',type:'food',icon:'🥗',value:8,rarity:'common',foodValue:3,desc:'Fresca.'},
        {id:'plg_food_sandwich',name:'Sándwich',type:'food',icon:'🥪',value:9,rarity:'common',foodValue:4,desc:'Completo.'},
        {id:'plg_food_icecream',name:'Helado',type:'food',icon:'🍨',value:10,rarity:'common',foodValue:3,desc:'Frío.'},
        {id:'plg_food_donut',name:'Dona',type:'food',icon:'🍩',value:6,rarity:'common',foodValue:2,desc:'Glaseada.'},
        {id:'plg_food_candy',name:'Dulces',type:'food',icon:'🍬',value:4,rarity:'common',foodValue:1,desc:'Azúcar.'},
        {id:'plg_food_chocolate',name:'Chocolate',type:'food',icon:'🍫',value:8,rarity:'common',foodValue:3,desc:'Negro.'},
        {id:'plg_food_ale',name:'Cerveza',type:'food',icon:'🍺',value:10,rarity:'common',foodValue:3,desc:'De taberna.'},
        {id:'plg_food_mead',name:'Hidromiel',type:'food',icon:'🍯',value:15,rarity:'rare',foodValue:4,desc:'Vikinga.'},
        {id:'plg_food_feast',name:'Festín Real',type:'food',icon:'👑',value:50,rarity:'epic',foodValue:12,desc:'De reyes.'},
        {id:'plg_food_dragon_meat',name:'Carne de Dragón',type:'food',icon:'🐲',value:80,rarity:'legendary',foodValue:15,desc:'Legendaria.'}
    ];
    
    newFoods.forEach(function(f) { f.fromPlugin = true; Data.items.push(f); });

    // ═══════════════════════════════════════════════════════════════
    // 50 PERGAMINOS DE HECHIZOS
    // ═══════════════════════════════════════════════════════════════
    
    var newScrolls = [
        // Hechizos de Fuego
        {id:'plg_scroll_fireball',name:'Pergamino: Bola de Fuego',type:'scroll',icon:'📜🔥',value:30,rarity:'common',spellId:'plg_sp_fireball',desc:'Aprende Bola de Fuego.'},
        {id:'plg_scroll_inferno',name:'Pergamino: Infierno',type:'scroll',icon:'📜🔥',value:60,rarity:'rare',spellId:'plg_sp_inferno',desc:'Aprende Infierno.'},
        {id:'plg_scroll_meteor',name:'Pergamino: Meteoro',type:'scroll',icon:'📜☄️',value:100,rarity:'epic',spellId:'plg_sp_meteor',desc:'Aprende Meteoro.'},
        {id:'plg_scroll_flame_wave',name:'Pergamino: Ola de Fuego',type:'scroll',icon:'📜🔥',value:45,rarity:'rare',spellId:'plg_sp_flame_wave',desc:'Aprende Ola de Fuego.'},
        {id:'plg_scroll_burn',name:'Pergamino: Quemar',type:'scroll',icon:'📜🔥',value:20,rarity:'common',spellId:'plg_sp_burn',desc:'Aprende Quemar.'},
        
        // Hechizos de Hielo
        {id:'plg_scroll_ice_ray',name:'Pergamino: Rayo de Hielo',type:'scroll',icon:'📜❄️',value:30,rarity:'common',spellId:'plg_sp_ice_ray',desc:'Aprende Rayo de Hielo.'},
        {id:'plg_scroll_blizzard',name:'Pergamino: Ventisca',type:'scroll',icon:'📜❄️',value:55,rarity:'rare',spellId:'plg_sp_blizzard',desc:'Aprende Ventisca.'},
        {id:'plg_scroll_freeze',name:'Pergamino: Congelar',type:'scroll',icon:'📜❄️',value:40,rarity:'rare',spellId:'plg_sp_freeze',desc:'Aprende Congelar.'},
        {id:'plg_scroll_frost_nova',name:'Pergamino: Nova de Escarcha',type:'scroll',icon:'📜❄️',value:65,rarity:'epic',spellId:'plg_sp_frost_nova',desc:'Aprende Nova de Escarcha.'},
        {id:'plg_scroll_ice_barrier',name:'Pergamino: Barrera de Hielo',type:'scroll',icon:'📜❄️',value:50,rarity:'rare',spellId:'plg_sp_ice_barrier',desc:'Aprende Barrera de Hielo.'},
        
        // Hechizos de Rayo
        {id:'plg_scroll_spark',name:'Pergamino: Chispa',type:'scroll',icon:'📜⚡',value:15,rarity:'common',spellId:'plg_sp_spark',desc:'Aprende Chispa.'},
        {id:'plg_scroll_lightning',name:'Pergamino: Relámpago',type:'scroll',icon:'📜⚡',value:45,rarity:'rare',spellId:'plg_sp_lightning',desc:'Aprende Relámpago.'},
        {id:'plg_scroll_thunder',name:'Pergamino: Trueno',type:'scroll',icon:'📜⚡',value:70,rarity:'epic',spellId:'plg_sp_thunder',desc:'Aprende Trueno.'},
        {id:'plg_scroll_chain_lightning',name:'Pergamino: Cadena de Rayos',type:'scroll',icon:'📜⚡',value:80,rarity:'epic',spellId:'plg_sp_chain_lightning',desc:'Aprende Cadena de Rayos.'},
        {id:'plg_scroll_static',name:'Pergamino: Estática',type:'scroll',icon:'📜⚡',value:25,rarity:'common',spellId:'plg_sp_static',desc:'Aprende Estática.'},
        
        // Hechizos de Curación
        {id:'plg_scroll_heal',name:'Pergamino: Curar',type:'scroll',icon:'📜💚',value:25,rarity:'common',spellId:'plg_sp_heal',desc:'Aprende Curar.'},
        {id:'plg_scroll_heal_greater',name:'Pergamino: Curación Mayor',type:'scroll',icon:'📜💚',value:50,rarity:'rare',spellId:'plg_sp_heal_greater',desc:'Aprende Curación Mayor.'},
        {id:'plg_scroll_regenerate',name:'Pergamino: Regenerar',type:'scroll',icon:'📜💚',value:70,rarity:'epic',spellId:'plg_sp_regenerate',desc:'Aprende Regenerar.'},
        {id:'plg_scroll_purify',name:'Pergamino: Purificar',type:'scroll',icon:'📜💚',value:35,rarity:'rare',spellId:'plg_sp_purify',desc:'Cura veneno/sangrado.'},
        {id:'plg_scroll_resurrect',name:'Pergamino: Resurrección',type:'scroll',icon:'📜💚',value:150,rarity:'legendary',spellId:'plg_sp_resurrect',desc:'Aprende Resurrección.'},
        
        // Hechizos Oscuros
        {id:'plg_scroll_drain',name:'Pergamino: Drenar Vida',type:'scroll',icon:'📜💜',value:40,rarity:'rare',spellId:'plg_sp_drain',desc:'Aprende Drenar Vida.'},
        {id:'plg_scroll_curse',name:'Pergamino: Maldición',type:'scroll',icon:'📜💜',value:35,rarity:'rare',spellId:'plg_sp_curse',desc:'Aprende Maldición.'},
        {id:'plg_scroll_fear',name:'Pergamino: Terror',type:'scroll',icon:'📜💜',value:45,rarity:'rare',spellId:'plg_sp_fear',desc:'Aprende Terror.'},
        {id:'plg_scroll_shadow_bolt',name:'Pergamino: Rayo Oscuro',type:'scroll',icon:'📜💜',value:55,rarity:'epic',spellId:'plg_sp_shadow_bolt',desc:'Aprende Rayo Oscuro.'},
        {id:'plg_scroll_doom',name:'Pergamino: Perdición',type:'scroll',icon:'📜💜',value:100,rarity:'legendary',spellId:'plg_sp_doom',desc:'Aprende Perdición.'},
        
        // Hechizos de Naturaleza
        {id:'plg_scroll_poison_cloud',name:'Pergamino: Nube Tóxica',type:'scroll',icon:'📜🌿',value:30,rarity:'common',spellId:'plg_sp_poison_cloud',desc:'Aprende Nube Tóxica.'},
        {id:'plg_scroll_entangle',name:'Pergamino: Enredar',type:'scroll',icon:'📜🌿',value:35,rarity:'rare',spellId:'plg_sp_entangle',desc:'Aprende Enredar.'},
        {id:'plg_scroll_thorns',name:'Pergamino: Espinas',type:'scroll',icon:'📜🌿',value:40,rarity:'rare',spellId:'plg_sp_thorns',desc:'Aprende Espinas.'},
        {id:'plg_scroll_summon_wolf',name:'Pergamino: Invocar Lobo',type:'scroll',icon:'📜🐺',value:60,rarity:'epic',spellId:'plg_sp_summon_wolf',desc:'Aprende Invocar Lobo.'},
        {id:'plg_scroll_earthquake',name:'Pergamino: Terremoto',type:'scroll',icon:'📜🌿',value:90,rarity:'epic',spellId:'plg_sp_earthquake',desc:'Aprende Terremoto.'},
        
        // Hechizos de Protección
        {id:'plg_scroll_shield',name:'Pergamino: Escudo Mágico',type:'scroll',icon:'📜🛡️',value:25,rarity:'common',spellId:'plg_sp_shield',desc:'Aprende Escudo Mágico.'},
        {id:'plg_scroll_armor',name:'Pergamino: Armadura Arcana',type:'scroll',icon:'📜🛡️',value:40,rarity:'rare',spellId:'plg_sp_armor',desc:'Aprende Armadura Arcana.'},
        {id:'plg_scroll_reflect',name:'Pergamino: Reflejar',type:'scroll',icon:'📜🛡️',value:55,rarity:'epic',spellId:'plg_sp_reflect',desc:'Aprende Reflejar.'},
        {id:'plg_scroll_immunity',name:'Pergamino: Inmunidad',type:'scroll',icon:'📜🛡️',value:80,rarity:'epic',spellId:'plg_sp_immunity',desc:'Aprende Inmunidad.'},
        {id:'plg_scroll_invincible',name:'Pergamino: Invencibilidad',type:'scroll',icon:'📜🛡️',value:120,rarity:'legendary',spellId:'plg_sp_invincible',desc:'Aprende Invencibilidad.'},
        
        // Hechizos de Mejora
        {id:'plg_scroll_haste',name:'Pergamino: Prisa',type:'scroll',icon:'📜💨',value:30,rarity:'common',spellId:'plg_sp_haste',desc:'Aprende Prisa.'},
        {id:'plg_scroll_strength',name:'Pergamino: Fuerza',type:'scroll',icon:'📜💪',value:35,rarity:'rare',spellId:'plg_sp_strength',desc:'Aprende Fuerza.'},
        {id:'plg_scroll_precision',name:'Pergamino: Precisión',type:'scroll',icon:'📜🎯',value:35,rarity:'rare',spellId:'plg_sp_precision',desc:'Aprende Precisión.'},
        {id:'plg_scroll_berserk',name:'Pergamino: Furia',type:'scroll',icon:'📜😤',value:50,rarity:'epic',spellId:'plg_sp_berserk',desc:'Aprende Furia.'},
        {id:'plg_scroll_divine_power',name:'Pergamino: Poder Divino',type:'scroll',icon:'📜✨',value:100,rarity:'legendary',spellId:'plg_sp_divine_power',desc:'Aprende Poder Divino.'},
        
        // Hechizos Elementales Mixtos
        {id:'plg_scroll_arcane_missile',name:'Pergamino: Misil Arcano',type:'scroll',icon:'📜✨',value:20,rarity:'common',spellId:'plg_sp_arcane_missile',desc:'Aprende Misil Arcano.'},
        {id:'plg_scroll_elemental_storm',name:'Pergamino: Tormenta Elemental',type:'scroll',icon:'📜🌪️',value:85,rarity:'epic',spellId:'plg_sp_elemental_storm',desc:'Aprende Tormenta Elemental.'},
        {id:'plg_scroll_chaos_bolt',name:'Pergamino: Rayo del Caos',type:'scroll',icon:'📜🌀',value:70,rarity:'epic',spellId:'plg_sp_chaos_bolt',desc:'Aprende Rayo del Caos.'},
        {id:'plg_scroll_disintegrate',name:'Pergamino: Desintegrar',type:'scroll',icon:'📜💥',value:110,rarity:'legendary',spellId:'plg_sp_disintegrate',desc:'Aprende Desintegrar.'},
        {id:'plg_scroll_time_stop',name:'Pergamino: Detener Tiempo',type:'scroll',icon:'📜⏰',value:150,rarity:'legendary',spellId:'plg_sp_time_stop',desc:'Aprende Detener Tiempo.'},
        
        // Hechizos de Utilidad
        {id:'plg_scroll_light',name:'Pergamino: Luz',type:'scroll',icon:'📜💡',value:10,rarity:'common',spellId:'plg_sp_light',desc:'Aprende Luz.'},
        {id:'plg_scroll_teleport',name:'Pergamino: Teletransporte',type:'scroll',icon:'📜🌀',value:60,rarity:'rare',spellId:'plg_sp_teleport',desc:'Aprende Teletransporte.'},
        {id:'plg_scroll_invisibility',name:'Pergamino: Invisibilidad',type:'scroll',icon:'📜👻',value:65,rarity:'epic',spellId:'plg_sp_invisibility',desc:'Aprende Invisibilidad.'},
        {id:'plg_scroll_detect_magic',name:'Pergamino: Detectar Magia',type:'scroll',icon:'📜👁️',value:25,rarity:'common',spellId:'plg_sp_detect_magic',desc:'Aprende Detectar Magia.'}
    ];
    
    newScrolls.forEach(function(s) { s.fromPlugin = true; Data.items.push(s); });

    // ═══════════════════════════════════════════════════════════════
    // 20 ACCESORIOS ESPECIALES
    // ═══════════════════════════════════════════════════════════════
    
    var newAccessories = [
        {id:'plg_acc_regen',name:'Orbe de Regeneración',type:'accessory',icon:'🔮',value:100,rarity:'epic',desc:'+1 HP/turno.',passive:true,effectType:'regen'},
        {id:'plg_acc_speed',name:'Botas de Velocidad',type:'accessory',icon:'👢',value:80,rarity:'rare',desc:'+3 velocidad.',passive:true,speedBonus:3},
        {id:'plg_acc_crit',name:'Anillo del Crítico',type:'accessory',icon:'💍',value:120,rarity:'epic',desc:'+15% crítico.',passive:true,critBonus:0.15},
        {id:'plg_acc_dodge',name:'Capa de Evasión',type:'accessory',icon:'🧥',value:90,rarity:'rare',desc:'+2 evasión.',passive:true,evasionBonus:2},
        {id:'plg_acc_thorns',name:'Anillo de Espinas',type:'accessory',icon:'🌹',value:110,rarity:'epic',desc:'Refleja 15% daño.',passive:true,thornsDamage:0.15},
        {id:'plg_acc_lifesteal',name:'Amuleto Vampírico',type:'accessory',icon:'🩸',value:130,rarity:'epic',desc:'Roba 10% vida.',passive:true,lifesteal:0.10},
        {id:'plg_acc_mana',name:'Gema de Maná',type:'accessory',icon:'💙',value:85,rarity:'rare',desc:'+20 maná.',passive:true,manaBonus:20},
        {id:'plg_acc_xp',name:'Amuleto de Sabiduría',type:'accessory',icon:'📿',value:95,rarity:'rare',desc:'+25% XP.',passive:true,xpBonus:0.25},
        {id:'plg_acc_gold',name:'Talismán de Fortuna',type:'accessory',icon:'🍀',value:100,rarity:'rare',desc:'+30% oro.',passive:true,goldBonus:0.30},
        {id:'plg_acc_armor',name:'Escudo Protector',type:'accessory',icon:'🛡️',value:90,rarity:'rare',desc:'+2 armadura.',passive:true,armorBonus:2},
        {id:'plg_acc_damage',name:'Guantelete de Poder',type:'accessory',icon:'🧤',value:105,rarity:'epic',desc:'+2 daño.',passive:true,damageBonus:2},
        {id:'plg_acc_first',name:'Amuleto de Iniciativa',type:'accessory',icon:'⚡',value:75,rarity:'rare',desc:'Siempre primero.',passive:true,initiativeBonus:100},
        {id:'plg_acc_poison_immune',name:'Perla Purificadora',type:'accessory',icon:'🫧',value:70,rarity:'rare',desc:'Inmune veneno.',passive:true,poisonImmune:true},
        {id:'plg_acc_fire_immune',name:'Rubí del Fénix',type:'accessory',icon:'🔴',value:85,rarity:'epic',desc:'Inmune fuego.',passive:true,fireImmune:true},
        {id:'plg_acc_ice_immune',name:'Zafiro Glacial',type:'accessory',icon:'🔵',value:85,rarity:'epic',desc:'Inmune hielo.',passive:true,iceImmune:true},
        {id:'plg_acc_lucky',name:'Trébol de 4 Hojas',type:'accessory',icon:'🍀',value:60,rarity:'rare',desc:'+10% drops.',passive:true,luckBonus:0.10},
        {id:'plg_acc_survivor',name:'Amuleto Superviviente',type:'accessory',icon:'💚',value:150,rarity:'legendary',desc:'Sobrevive 1HP.',passive:true,surviveOnce:true},
        {id:'plg_acc_double',name:'Guantes Doble Golpe',type:'accessory',icon:'🥊',value:140,rarity:'legendary',desc:'20% doble ataque.',passive:true,doubleAttack:0.20},
        {id:'plg_acc_counter',name:'Brazalete Contraataque',type:'accessory',icon:'⚔️',value:120,rarity:'epic',desc:'25% contraataque.',passive:true,counterAttack:0.25},
        {id:'plg_acc_heal_boost',name:'Cruz Sagrada',type:'accessory',icon:'✝️',value:80,rarity:'rare',desc:'+50% curación.',passive:true,healBonus:0.50}
    ];
    
    newAccessories.forEach(function(a) { a.fromPlugin = true; Data.items.push(a); });
    
    // Registrar efectos pasivos de accesorios
    newAccessories.forEach(function(a) {
        Plugins.registerItem({
            id: a.id, name: a.name, icon: a.icon, passive: true,
            speedBonus: a.speedBonus || 0, critBonus: a.critBonus || 0,
            evasionBonus: a.evasionBonus || 0, armorBonus: a.armorBonus || 0,
            damageBonus: a.damageBonus || 0, manaBonus: a.manaBonus || 0,
            lifesteal: a.lifesteal || 0, thornsDamage: a.thornsDamage || 0,
            onTurnStart: function(entity) {
                if (a.effectType === 'regen' && entity.hp < entity.maxHp) {
                    entity.hp = Math.min(entity.maxHp, entity.hp + 1);
                    if (typeof Combat !== 'undefined' && G.combat) Combat.log('<span class="log-heal">🔮 +1 HP</span>');
                }
            },
            onDealDamage: function(attacker, target, damage) {
                if (a.lifesteal > 0) {
                    var stolen = Math.max(1, Math.floor(damage * a.lifesteal));
                    attacker.hp = Math.min(attacker.maxHp, attacker.hp + stolen);
                    if (typeof Combat !== 'undefined') Combat.log('<span class="log-heal">🩸 +' + stolen + '</span>');
                }
                return damage;
            },
            onTakeDamage: function(defender, attacker, damage) {
                if (a.thornsDamage > 0 && attacker && attacker.hp) {
                    var reflected = Math.max(1, Math.floor(damage * a.thornsDamage));
                    attacker.hp -= reflected;
                    if (typeof Combat !== 'undefined') Combat.log('<span class="log-damage">🌹 ' + reflected + '</span>');
                }
                return damage;
            }
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // ARMAS (25)
    // ═══════════════════════════════════════════════════════════════
    
    var newWeapons = [
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
        {id:'plg_wpn_staff_fire',name:'Bastón de Fuego',damage:'1d6',icon:'🔥',value:80,rarity:'rare',weight:2,magic:true,manaBonus:15,effect:'fire'},
        {id:'plg_wpn_staff_ice',name:'Bastón de Hielo',damage:'1d6',icon:'❄️',value:80,rarity:'rare',weight:2,magic:true,manaBonus:15,effect:'ice'},
        {id:'plg_wpn_staff_thunder',name:'Bastón del Trueno',damage:'1d8',icon:'⚡',value:100,rarity:'epic',weight:2,magic:true,manaBonus:20},
        {id:'plg_wpn_staff_nature',name:'Bastón Naturaleza',damage:'1d4',icon:'🌿',value:70,rarity:'rare',weight:1,magic:true,manaBonus:25},
        {id:'plg_wpn_staff_dark',name:'Bastón Oscuro',damage:'1d10',icon:'🌑',value:120,rarity:'epic',weight:3,magic:true,manaBonus:10},
        {id:'plg_wpn_staff_arcane',name:'Bastón Arcano',damage:'1d8',icon:'🔮',value:150,rarity:'legendary',weight:2,magic:true,manaBonus:30},
        {id:'plg_wpn_wand',name:'Varita Mágica',damage:'1d4',icon:'✨',value:40,rarity:'common',weight:0,magic:true,manaBonus:10},
        {id:'plg_wpn_orb',name:'Orbe de Poder',damage:'1d6',icon:'🔮',value:90,rarity:'epic',weight:1,magic:true,manaBonus:20}
    ];
    
    newWeapons.forEach(function(w) { w.fromPlugin = true; Data.weapons.push(w); });

    // ═══════════════════════════════════════════════════════════════
    // ARMADURAS (12)
    // ═══════════════════════════════════════════════════════════════
    
    var newArmors = [
        {id:'plg_arm_padded',name:'Acolchada',defense:1,icon:'👕',value:15,rarity:'common',weight:1},
        {id:'plg_arm_leather',name:'Cuero',defense:2,icon:'🦺',value:35,rarity:'common',weight:2},
        {id:'plg_arm_studded',name:'Tachonado',defense:3,icon:'🦺',value:50,rarity:'rare',weight:3},
        {id:'plg_arm_chain',name:'Cota de Malla',defense:4,icon:'⛓️',value:80,rarity:'rare',weight:5},
        {id:'plg_arm_scale',name:'Escamas',defense:4,icon:'🐉',value:90,rarity:'rare',weight:5},
        {id:'plg_arm_breast',name:'Coraza',defense:5,icon:'🛡️',value:120,rarity:'epic',weight:4},
        {id:'plg_arm_half',name:'Media Armadura',defense:6,icon:'🛡️',value:150,rarity:'epic',weight:6},
        {id:'plg_arm_full',name:'Completa',defense:8,icon:'⚔️',value:250,rarity:'legendary',weight:8},
        {id:'plg_arm_mage',name:'Túnica Mago',defense:1,icon:'🧥',value:60,rarity:'rare',weight:0,magic:true,manaBonus:20},
        {id:'plg_arm_archmage',name:'Túnica Archimago',defense:2,icon:'🧙',value:150,rarity:'legendary',weight:0,magic:true,manaBonus:40},
        {id:'plg_arm_dragon',name:'Armadura Dragón',defense:7,icon:'🐲',value:300,rarity:'legendary',weight:4},
        {id:'plg_arm_shadow',name:'Sombras',defense:3,icon:'🌑',value:100,rarity:'epic',weight:1}
    ];
    
    newArmors.forEach(function(a) { a.fromPlugin = true; Data.armors.push(a); });

    // ═══════════════════════════════════════════════════════════════
    // MASCOTAS (12)
    // ═══════════════════════════════════════════════════════════════
    
    var newPets = [
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
    
    newPets.forEach(function(p) { p.fromPlugin = true; Data.pets.push(p); });

    // ═══════════════════════════════════════════════════════════════
    // ENEMIGOS (35)
    // ═══════════════════════════════════════════════════════════════
    
    var newEnemies = [
        {id:'plg_rat',name:'Rata Gigante',health:8,damage:'1d4',difficulty:6,armor:0,speed:14,icon:'🐀',loot:[2,8],drops:[{itemId:'plg_rat_tail',chance:70}],regions:['mazmorra','pueblo'],canGroup:true,groupMin:3,groupMax:6,groupChance:60},
        {id:'plg_bat',name:'Murciélago',health:6,damage:'1d3',difficulty:7,armor:0,speed:16,icon:'🦇',loot:[3,8],drops:[{itemId:'plg_wing',chance:60},{itemId:'plg_bat_fang',chance:40}],regions:['mazmorra','plg_catacumbas'],canGroup:true,groupMin:3,groupMax:5,groupChance:70},
        {id:'plg_spider',name:'Araña Venenosa',health:10,damage:'1d4',difficulty:8,armor:0,speed:13,icon:'🕷️',effect:'poison',loot:[5,15],drops:[{itemId:'plg_silk',chance:60},{itemId:'plg_venom',chance:15}],regions:['bosque','mazmorra'],canGroup:true,groupMin:2,groupMax:4,groupChance:40},
        {id:'plg_slime',name:'Slime',health:15,damage:'1d4',difficulty:6,armor:0,speed:6,icon:'🟢',loot:[3,10],drops:[{itemId:'plg_slime',chance:80},{itemId:'plg_mucus',chance:50}],regions:['mazmorra','pantano'],canGroup:true,groupMin:2,groupMax:5,groupChance:50},
        {id:'plg_zombie',name:'Zombi',health:18,damage:'1d6',difficulty:8,armor:0,speed:6,icon:'🧟',loot:[8,20],drops:[{itemId:'plg_zombie_flesh',chance:70},{itemId:'plg_bone',chance:40}],regions:['plg_cementerio','plg_catacumbas'],canGroup:true,groupMin:2,groupMax:4,groupChance:50},
        {id:'plg_skeleton',name:'Esqueleto',health:12,damage:'1d6',difficulty:9,armor:1,speed:10,icon:'💀',loot:[10,20],drops:[{itemId:'plg_bone',chance:80},{itemId:'plg_skull',chance:20}],regions:['mazmorra','plg_catacumbas','plg_cementerio'],canGroup:true,groupMin:2,groupMax:3,groupChance:40},
        {id:'plg_imp',name:'Diablillo',health:10,damage:'1d6',difficulty:10,armor:0,speed:15,icon:'😈',effect:'fire',loot:[12,25],drops:[{itemId:'plg_ember',chance:30},{itemId:'plg_demon_horn',chance:5}],regions:['plg_torre','plg_volcan'],canGroup:true,groupMin:2,groupMax:3,groupChance:30},
        {id:'plg_ghost',name:'Fantasma',health:20,damage:'1d6',difficulty:12,armor:0,speed:14,icon:'👻',loot:[15,30],drops:[{itemId:'plg_ectoplasm',chance:50},{itemId:'plg_shadow',chance:15}],regions:['plg_cementerio','plg_catacumbas'],canGroup:false},
        {id:'plg_ghoul',name:'Necrófago',health:25,damage:'1d8',difficulty:11,armor:1,speed:12,icon:'👹',effect:'poison',loot:[18,35],drops:[{itemId:'plg_claw',chance:40}],regions:['plg_cementerio','plg_catacumbas'],canGroup:true,groupMin:2,groupMax:3,groupChance:30},
        {id:'plg_banshee',name:'Banshee',health:22,damage:'1d8',difficulty:13,armor:0,speed:13,icon:'👻',loot:[20,40],drops:[{itemId:'plg_ectoplasm',chance:60},{itemId:'plg_shadow',chance:25}],regions:['plg_cementerio'],canGroup:false},
        {id:'plg_gargoyle',name:'Gárgola',health:30,damage:'1d8',difficulty:12,armor:4,speed:10,icon:'🗿',loot:[25,45],drops:[{itemId:'plg_iron',chance:40},{itemId:'plg_golem_core',chance:10}],regions:['plg_torre'],canGroup:true,groupMin:2,groupMax:2,groupChance:25},
        {id:'plg_golem',name:'Golem',health:40,damage:'1d10',difficulty:13,armor:5,speed:6,icon:'🗿',loot:[30,50],drops:[{itemId:'plg_iron',chance:60},{itemId:'plg_golem_core',chance:25},{itemId:'plg_crystal',chance:10}],regions:['plg_torre','mazmorra'],canGroup:false},
        {id:'plg_werewolf',name:'Hombre Lobo',health:35,damage:'1d10',difficulty:14,armor:2,speed:15,icon:'🐺',effect:'bleed',loot:[25,50],drops:[{itemId:'plg_fur',chance:50},{itemId:'plg_fang',chance:40},{itemId:'plg_werewolf_claw',chance:30}],regions:['bosque'],canGroup:false},
        {id:'plg_harpy',name:'Arpía',health:22,damage:'1d8',difficulty:11,armor:0,speed:16,icon:'🦅',loot:[20,40],drops:[{itemId:'plg_feather',chance:50},{itemId:'plg_harpy_talon',chance:25}],regions:['montana'],canGroup:true,groupMin:2,groupMax:3,groupChance:35},
        {id:'plg_ogre',name:'Ogro',health:50,damage:'2d6',difficulty:13,armor:2,speed:7,icon:'👹',loot:[30,60],drops:[{itemId:'plg_claw',chance:30},{itemId:'plg_leather',chance:40}],regions:['montana','pantano'],canGroup:false},
        {id:'plg_minotaur',name:'Minotauro',health:45,damage:'2d8',difficulty:15,armor:3,speed:10,icon:'🐂',loot:[40,80],drops:[{itemId:'plg_horn',chance:40},{itemId:'plg_leather',chance:50}],regions:['mazmorra'],canGroup:false},
        {id:'plg_crab',name:'Cangrejo Gigante',health:35,damage:'1d10',difficulty:12,armor:5,speed:8,icon:'🦀',loot:[20,45],drops:[{itemId:'plg_shell',chance:70},{itemId:'plg_pearl',chance:10}],regions:['plg_abismo','pantano'],canGroup:false},
        {id:'plg_shark',name:'Tiburón',health:40,damage:'2d6',difficulty:13,armor:1,speed:14,icon:'🦈',loot:[25,50],drops:[{itemId:'plg_tooth',chance:60}],regions:['plg_abismo'],canGroup:false},
        {id:'plg_mermaid',name:'Sirena Oscura',health:28,damage:'1d8',difficulty:12,armor:0,speed:13,icon:'🧜',loot:[30,55],drops:[{itemId:'plg_mermaid_scale',chance:40},{itemId:'plg_pearl',chance:25}],regions:['plg_abismo'],canGroup:false},
        {id:'plg_salamander',name:'Salamandra',health:30,damage:'1d10',difficulty:12,armor:1,speed:12,icon:'🦎',effect:'fire',loot:[25,45],drops:[{itemId:'plg_ember',chance:50},{itemId:'plg_scale',chance:20}],regions:['plg_volcan'],canGroup:true,groupMin:2,groupMax:2,groupChance:30},
        {id:'plg_vampire',name:'Vampiro',health:40,damage:'1d8',difficulty:14,armor:1,speed:14,icon:'🧛',loot:[35,70],drops:[{itemId:'plg_fang',chance:50},{itemId:'plg_shadow',chance:30}],regions:['plg_catacumbas'],canGroup:false},
        {id:'plg_necromancer',name:'Nigromante',health:25,damage:'1d8',difficulty:14,armor:0,speed:10,icon:'🧙‍♂️',usesMana:true,loot:[30,60],drops:[{itemId:'plg_book_spell',chance:20},{itemId:'plg_shadow',chance:40},{itemId:'plg_skull',chance:30}],regions:['plg_catacumbas','plg_cementerio'],canGroup:false},
        {id:'plg_wizard',name:'Mago Oscuro',health:30,damage:'2d6',difficulty:14,armor:0,speed:11,icon:'🧙',usesMana:true,loot:[35,65],drops:[{itemId:'plg_book_spell',chance:25},{itemId:'plg_crystal',chance:30}],regions:['plg_torre'],canGroup:false},
        {id:'plg_ice_elem',name:'Elemental Hielo',health:30,damage:'1d8',difficulty:13,armor:2,speed:10,icon:'❄️',effect:'ice',loot:[25,50],drops:[{itemId:'plg_frost',chance:60},{itemId:'plg_sapphire',chance:5}],regions:['montana'],canGroup:false},
        {id:'plg_fire_elem',name:'Elemental Fuego',health:30,damage:'1d10',difficulty:13,armor:1,speed:12,icon:'🔥',effect:'fire',loot:[25,50],drops:[{itemId:'plg_ember',chance:60},{itemId:'plg_ruby',chance:5}],regions:['plg_volcan'],canGroup:false},
        {id:'plg_elemental',name:'Elemental Arcano',health:35,damage:'1d10',difficulty:14,armor:2,speed:11,icon:'✨',loot:[30,55],drops:[{itemId:'plg_crystal',chance:50},{itemId:'plg_mithril',chance:15}],regions:['plg_torre'],canGroup:false},
        {id:'plg_lava_golem',name:'Golem de Lava',health:50,damage:'2d6',difficulty:15,armor:4,speed:6,icon:'🌋',effect:'fire',loot:[40,70],drops:[{itemId:'plg_ember',chance:70},{itemId:'plg_golem_core',chance:30},{itemId:'plg_ruby',chance:10}],regions:['plg_volcan'],canGroup:false},
        {id:'plg_sea_serpent',name:'Serpiente Marina',health:55,damage:'2d8',difficulty:15,armor:3,speed:12,icon:'🐉',loot:[45,80],drops:[{itemId:'plg_scale',chance:50},{itemId:'plg_pearl',chance:30}],regions:['plg_abismo'],canGroup:false},
        {id:'plg_kraken_tentacle',name:'Tentáculo Kraken',health:40,damage:'1d12',difficulty:14,armor:2,speed:10,icon:'🦑',loot:[35,65],drops:[{itemId:'plg_kraken_ink',chance:50}],regions:['plg_abismo'],canGroup:true,groupMin:2,groupMax:4,groupChance:40},
        {id:'plg_dragon_young',name:'Dragón Joven',health:60,damage:'2d8',difficulty:16,armor:4,speed:12,icon:'🐲',effect:'fire',loot:[60,120],drops:[{itemId:'plg_scale',chance:60},{itemId:'plg_ruby',chance:15},{itemId:'plg_heart',chance:20}],regions:['montana','plg_volcan'],canGroup:false},
        {id:'plg_phoenix',name:'Fénix',health:50,damage:'2d10',difficulty:17,armor:2,speed:16,icon:'🔥',effect:'fire',loot:[70,130],drops:[{itemId:'plg_phoenix_ash',chance:40},{itemId:'plg_feather',chance:60}],regions:['plg_volcan'],canGroup:false},
        {id:'plg_lich',name:'Lich',health:55,damage:'2d8',difficulty:17,armor:2,speed:10,icon:'💀',usesMana:true,loot:[65,120],drops:[{itemId:'plg_skull',chance:70},{itemId:'plg_shadow',chance:50},{itemId:'plg_diamond',chance:5}],regions:['plg_catacumbas'],canGroup:false},
        {id:'plg_demon',name:'Demonio Mayor',health:70,damage:'2d10',difficulty:18,armor:3,speed:12,icon:'👿',effect:'fire',loot:[80,150],drops:[{itemId:'plg_demon_horn',chance:50},{itemId:'plg_shadow',chance:40}],regions:['plg_volcan','plg_catacumbas'],canGroup:false},
        {id:'plg_dragon_elder',name:'Dragón Anciano',health:100,damage:'3d8',difficulty:20,armor:6,speed:10,icon:'🐉',effect:'fire',loot:[150,300],drops:[{itemId:'plg_scale',chance:80},{itemId:'plg_dragon_blood',chance:50},{itemId:'plg_diamond',chance:20}],regions:['plg_volcan'],canGroup:false}
    ];
    
    newEnemies.forEach(function(e) { e.fromPlugin = true; Data.enemies.push(e); });

    // ═══════════════════════════════════════════════════════════════
    // HECHIZOS (15 base para los pergaminos)
    // ═══════════════════════════════════════════════════════════════
    
    var newSpells = [
        {id:'plg_sp_fireball',name:'Bola de Fuego',damage:'2d6',cost:4,icon:'🔥',effect:'fire',desc:'Fuego ardiente.'},
        {id:'plg_sp_inferno',name:'Infierno',damage:'2d8',cost:8,icon:'🔥',effect:'fire',desc:'Fuego devastador.'},
        {id:'plg_sp_meteor',name:'Meteoro',damage:'3d6',cost:10,icon:'☄️',effect:'fire',desc:'Del cielo.'},
        {id:'plg_sp_ice_ray',name:'Rayo de Hielo',damage:'1d8',cost:4,icon:'❄️',effect:'ice',desc:'30% congelar.'},
        {id:'plg_sp_blizzard',name:'Ventisca',damage:'2d4',cost:6,icon:'🌨️',effect:'ice',desc:'Hielo en área.'},
        {id:'plg_sp_lightning',name:'Relámpago',damage:'2d6',cost:5,icon:'⚡',desc:'Eléctrico.'},
        {id:'plg_sp_thunder',name:'Trueno',damage:'3d6',cost:8,icon:'⚡',desc:'Devastador.'},
        {id:'plg_sp_heal',name:'Curar',damage:'0',cost:4,icon:'💚',healAmount:'2d6',desc:'Cura 2d6.'},
        {id:'plg_sp_heal_greater',name:'Curación Mayor',damage:'0',cost:6,icon:'💚',healAmount:'3d6',desc:'Cura 3d6.'},
        {id:'plg_sp_drain',name:'Drenar Vida',damage:'1d6',cost:4,icon:'💜',desc:'Roba HP.'},
        {id:'plg_sp_shadow_bolt',name:'Rayo Oscuro',damage:'2d8',cost:6,icon:'🌑',desc:'Oscuridad.'},
        {id:'plg_sp_shield',name:'Escudo Mágico',damage:'0',cost:3,icon:'🛡️',desc:'+5 armadura 2 turnos.'},
        {id:'plg_sp_haste',name:'Prisa',damage:'0',cost:3,icon:'💨',desc:'+5 velocidad 2 turnos.'},
        {id:'plg_sp_strength',name:'Fuerza',damage:'0',cost:4,icon:'💪',desc:'+3 daño 3 turnos.'},
        {id:'plg_sp_arcane_missile',name:'Misil Arcano',damage:'1d10',cost:3,icon:'✨',desc:'Nunca falla.'}
    ];
    
    if (!Data.spells) Data.spells = [];
    newSpells.forEach(function(s) { s.fromPlugin = true; Data.spells.push(s); });

    // ═══════════════════════════════════════════════════════════════
    // APLICAR SPRITES PERSONALIZADOS
    // ═══════════════════════════════════════════════════════════════
    
    if (Data.pluginSprites) {
        var sprites = Data.pluginSprites;
        ['weapons','armors','items','enemies','pets','regions'].forEach(function(key) {
            (Data[key] || []).forEach(function(item) {
                if (item.id && sprites[item.id]) {
                    item.sprite = sprites[item.id];
                }
            });
        });
        console.log('🖼️ Sprites personalizados aplicados:', Object.keys(sprites).length);
    }

    // ═══════════════════════════════════════════════════════════════
    // RESUMEN
    // ═══════════════════════════════════════════════════════════════
    
    console.log('📦 Plugin v16 cargado:');
    console.log('   Regiones: +' + newRegions.length);
    console.log('   Items: +' + newItems.length);
    console.log('   Comidas: +' + newFoods.length);
    console.log('   Pergaminos: +' + newScrolls.length);
    console.log('   Accesorios: +' + newAccessories.length);
    console.log('   Armas: +' + newWeapons.length);
    console.log('   Armaduras: +' + newArmors.length);
    console.log('   Mascotas: +' + newPets.length);
    console.log('   Enemigos: +' + newEnemies.length);
    console.log('   Hechizos: +' + newSpells.length);
    
    // Actualizar Editor
    if (typeof Editor !== 'undefined' && Editor.renderAll) {
        setTimeout(function() { Editor.renderAll(); Editor.updateSelects(); }, 100);
    }
}

// Plugins de sistema
Plugins.register({
    id: 'combo_system', name: 'Combo', comboCount: 0,
    onCombatStart: function() { this.comboCount = 0; },
    onAttack: function(attacker, target, damage, hit) {
        if (typeof G === 'undefined' || !G.p || attacker !== G.p) return damage;
        if (hit) {
            this.comboCount++;
            if (this.comboCount >= 3) {
                var bonus = Math.floor(damage * 0.1 * (this.comboCount - 2));
                if (bonus > 0 && typeof Combat !== 'undefined') Combat.log('<span class="log-crit">🔥 Combo x' + this.comboCount + '</span>');
                return damage + bonus;
            }
        } else { this.comboCount = 0; }
        return damage;
    },
    onCombatEnd: function() { this.comboCount = 0; }
});

// Cargar al inicio
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPluginItems);
} else {
    loadPluginItems();
}

console.log('🎮 RPG Plugins v16 listo');
