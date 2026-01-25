/**
 * RPG Plugins System - Extensiones para Aventuras RPG v12
 * 
 * Incluye:
 * - Sistema de efectos (hielo con congelación, fuego, veneno, sangrado)
 * - 12 mascotas nuevas
 * - 15 enemigos nuevos con drops específicos
 * - 25 armas nuevas (físicas y mágicas)
 * - 12 armaduras nuevas
 * - 55+ items de drop/materiales
 */

var Plugins = {
    registry: [],
    specialItems: {},
    customEffects: {},
    
    register: function(plugin) {
        if (!plugin.id) { console.error('Plugin sin ID'); return; }
        this.registry.push(plugin);
        console.log('✨ Plugin registrado: ' + (plugin.name || plugin.id));
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
    
    registerItem: function(itemDef) {
        this.specialItems[itemDef.id] = itemDef;
    },
    
    registerEffect: function(effectDef) {
        this.customEffects[effectDef.id] = effectDef;
    },
    
    getSpecialItem: function(id) {
        return this.specialItems[id];
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
// EFECTOS DE ESTADO PERSONALIZADOS
// ═══════════════════════════════════════════════════════════════════

Plugins.registerEffect({
    id: 'ice',
    name: 'Hielo',
    icon: '❄️',
    freezeChance: 0.30
});

Plugins.registerEffect({
    id: 'fury',
    name: 'Furia',
    icon: '🔥',
    getDamageMultiplier: function() { return 1.5; }
});

Plugins.registerEffect({
    id: 'shield',
    name: 'Escudo Mágico',
    icon: '🛡️'
});

// ═══════════════════════════════════════════════════════════════════
// INYECCIÓN DE DATOS AL JUEGO
// ═══════════════════════════════════════════════════════════════════

function injectPluginData() {
    if (typeof Data === 'undefined') {
        setTimeout(injectPluginData, 100);
        return;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // 55+ ITEMS DE DROP / MATERIALES
    // ═══════════════════════════════════════════════════════════════
    
    var newItems = [
        // === MATERIALES DE MONSTRUOS ===
        {id:'mat_silk',name:'Hilo de Araña',type:'misc',icon:'🕸️',value:8,rarity:'common',desc:'Seda resistente de araña.'},
        {id:'mat_fang',name:'Colmillo de Lobo',type:'misc',icon:'🦷',value:12,rarity:'common',desc:'Colmillo afilado.'},
        {id:'mat_scale',name:'Escama de Dragón',type:'misc',icon:'🐉',value:50,rarity:'epic',desc:'Escama brillante y dura.'},
        {id:'mat_bone',name:'Hueso',type:'misc',icon:'🦴',value:5,rarity:'common',desc:'Hueso de criatura.'},
        {id:'mat_leather',name:'Cuero Crudo',type:'misc',icon:'🟫',value:10,rarity:'common',desc:'Piel sin curtir.'},
        {id:'mat_fur',name:'Piel de Oso',type:'misc',icon:'🧸',value:25,rarity:'rare',desc:'Pelaje grueso y cálido.'},
        {id:'mat_claw',name:'Garra de Troll',type:'misc',icon:'🦎',value:30,rarity:'rare',desc:'Garra enorme y curva.'},
        {id:'mat_eye',name:'Ojo de Cíclope',type:'misc',icon:'👁️',value:45,rarity:'epic',desc:'Ojo gigante mágico.'},
        {id:'mat_horn',name:'Cuerno de Minotauro',type:'misc',icon:'🐂',value:40,rarity:'rare',desc:'Cuerno macizo.'},
        {id:'mat_wing',name:'Ala de Murciélago',type:'misc',icon:'🦇',value:15,rarity:'common',desc:'Membrana de ala.'},
        {id:'mat_slime',name:'Gelatina',type:'misc',icon:'🟢',value:6,rarity:'common',desc:'Sustancia viscosa.'},
        {id:'mat_venom',name:'Veneno de Serpiente',type:'misc',icon:'🐍',value:20,rarity:'rare',desc:'Toxina mortal.'},
        {id:'mat_feather',name:'Pluma de Grifo',type:'misc',icon:'🪶',value:35,rarity:'rare',desc:'Pluma dorada.'},
        {id:'mat_pearl',name:'Perla Marina',type:'misc',icon:'🫧',value:55,rarity:'epic',desc:'Perla brillante del mar.'},
        {id:'mat_crystal',name:'Cristal Mágico',type:'misc',icon:'💎',value:60,rarity:'epic',desc:'Cristal con poder arcano.'},
        {id:'mat_ember',name:'Brasa Elemental',type:'misc',icon:'🔥',value:40,rarity:'rare',desc:'Fuego que no se apaga.'},
        {id:'mat_frost',name:'Esencia de Hielo',type:'misc',icon:'❄️',value:40,rarity:'rare',desc:'Fragmento de frío eterno.'},
        {id:'mat_shadow',name:'Esencia Oscura',type:'misc',icon:'🌑',value:50,rarity:'epic',desc:'Sombra condensada.'},
        {id:'mat_heart',name:'Corazón de Bestia',type:'misc',icon:'❤️',value:35,rarity:'rare',desc:'Corazón aún latiente.'},
        {id:'mat_tooth',name:'Diente de Tiburón',type:'misc',icon:'🦈',value:18,rarity:'common',desc:'Diente serrado.'},
        {id:'mat_shell',name:'Caparazón',type:'misc',icon:'🐚',value:12,rarity:'common',desc:'Concha dura.'},
        {id:'mat_antenna',name:'Antena de Insecto',type:'misc',icon:'🐜',value:8,rarity:'common',desc:'Sensor de insecto.'},
        {id:'mat_stinger',name:'Aguijón',type:'misc',icon:'🐝',value:15,rarity:'common',desc:'Aguijón venenoso.'},
        {id:'mat_mucus',name:'Mucosidad',type:'misc',icon:'💧',value:4,rarity:'common',desc:'Baba pegajosa.'},
        {id:'mat_tail',name:'Cola de Lagarto',type:'misc',icon:'🦎',value:10,rarity:'common',desc:'Se regenera sola.'},
        {id:'mat_goblin_ear',name:'Oreja de Goblin',type:'misc',icon:'👂',value:7,rarity:'common',desc:'Trofeo de caza.'},
        {id:'mat_wolf_pelt',name:'Piel de Lobo',type:'misc',icon:'🐺',value:20,rarity:'common',desc:'Pelaje gris.'},
        {id:'mat_spider_leg',name:'Pata de Araña',type:'misc',icon:'🦵',value:6,rarity:'common',desc:'Articulada y peluda.'},
        {id:'mat_rat_tail',name:'Cola de Rata',type:'misc',icon:'🐀',value:3,rarity:'common',desc:'Asquerosa pero útil.'},
        {id:'mat_bat_fang',name:'Colmillo de Murciélago',type:'misc',icon:'🦷',value:8,rarity:'common',desc:'Pequeño y afilado.'},
        
        // === GEMAS Y MINERALES ===
        {id:'gem_ruby',name:'Rubí',type:'misc',icon:'🔴',value:80,rarity:'epic',desc:'Gema roja brillante.'},
        {id:'gem_sapphire',name:'Zafiro',type:'misc',icon:'🔵',value:80,rarity:'epic',desc:'Gema azul profundo.'},
        {id:'gem_emerald',name:'Esmeralda',type:'misc',icon:'🟢',value:80,rarity:'epic',desc:'Gema verde vivo.'},
        {id:'gem_diamond',name:'Diamante',type:'misc',icon:'💠',value:150,rarity:'legendary',desc:'La gema más dura.'},
        {id:'ore_iron',name:'Mineral de Hierro',type:'misc',icon:'ite�ite🪨',value:15,rarity:'common',desc:'Metal común.'},
        {id:'ore_gold',name:'Pepita de Oro',type:'misc',icon:'🥇',value:50,rarity:'rare',desc:'Oro puro.'},
        {id:'ore_silver',name:'Plata',type:'misc',icon:'🥈',value:30,rarity:'rare',desc:'Metal precioso.'},
        {id:'ore_mithril',name:'Mithril',type:'misc',icon:'✨',value:100,rarity:'epic',desc:'Metal élfico legendario.'},
        
        // === HIERBAS Y PLANTAS ===
        {id:'herb_heal',name:'Hierba Curativa',type:'misc',icon:'🌿',value:10,rarity:'common',desc:'Planta medicinal.'},
        {id:'herb_mana',name:'Flor de Maná',type:'misc',icon:'🌸',value:15,rarity:'common',desc:'Restaura energía mágica.'},
        {id:'herb_poison',name:'Belladona',type:'misc',icon:'🍇',value:12,rarity:'common',desc:'Planta venenosa.'},
        {id:'herb_rare',name:'Raíz Arcana',type:'misc',icon:'🌱',value:40,rarity:'rare',desc:'Ingrediente mágico raro.'},
        {id:'mushroom_red',name:'Hongo Rojo',type:'misc',icon:'🍄',value:8,rarity:'common',desc:'¿Comestible?'},
        
        // === OBJETOS VARIOS ===
        {id:'key_rusty',name:'Llave Oxidada',type:'misc',icon:'🗝️',value:5,rarity:'common',desc:'Abre algo en algún lugar.'},
        {id:'map_torn',name:'Mapa Rasgado',type:'misc',icon:'🗺️',value:20,rarity:'rare',desc:'Fragmento de mapa antiguo.'},
        {id:'coin_ancient',name:'Moneda Antigua',type:'misc',icon:'🪙',value:25,rarity:'rare',desc:'Coleccionable valioso.'},
        {id:'book_spell',name:'Tomo Arcano',type:'misc',icon:'📕',value:60,rarity:'epic',desc:'Contiene conocimiento mágico.'},
        {id:'scroll_blank',name:'Pergamino en Blanco',type:'misc',icon:'📜',value:15,rarity:'common',desc:'Listo para escribir.'},
        {id:'rope',name:'Cuerda',type:'misc',icon:'🪢',value:8,rarity:'common',desc:'Siempre útil.'},
        {id:'torch',name:'Antorcha',type:'misc',icon:'🔦',value:5,rarity:'common',desc:'Ilumina la oscuridad.'},
        {id:'skull',name:'Cráneo',type:'misc',icon:'💀',value:15,rarity:'common',desc:'Macabro pero útil.'},
        {id:'lucky_charm',name:'Amuleto de Suerte',type:'misc',icon:'🍀',value:50,rarity:'rare',desc:'+5% suerte.'},
        
        // === COMIDAS ===
        {id:'food_bread',name:'Pan',type:'food',icon:'🍞',value:5,rarity:'common',foodValue:3,desc:'Pan fresco.'},
        {id:'food_cheese',name:'Queso',type:'food',icon:'🧀',value:8,rarity:'common',foodValue:4,desc:'Queso curado.'},
        {id:'food_apple',name:'Manzana',type:'food',icon:'🍎',value:3,rarity:'common',foodValue:2,desc:'Fruta fresca.'},
        {id:'food_fish',name:'Pescado Asado',type:'food',icon:'🐟',value:10,rarity:'common',foodValue:5,desc:'Pescado cocinado.'},
        {id:'food_stew',name:'Estofado',type:'food',icon:'🍲',value:20,rarity:'rare',foodValue:8,desc:'Comida nutritiva.'},
        {id:'food_meat',name:'Carne Asada',type:'food',icon:'🍖',value:12,rarity:'common',foodValue:6,desc:'Carne jugosa.'},
        
        // === POCIONES ===
        {id:'pot_mana',name:'Poción de Maná',type:'potion',icon:'🧪',value:25,rarity:'common',potionType:'mana',effect:'2d8',desc:'Restaura maná.'},
        {id:'pot_invisibility',name:'Poción de Invisibilidad',type:'escape',icon:'👻',value:60,rarity:'epic',desc:'Escapa de cualquier combate.'}
    ];
    
    // Inyectar items
    newItems.forEach(function(item) {
        item.fromPlugin = true;
        if (!Data.items.find(function(i) { return i.id === item.id; })) {
            Data.items.push(item);
        }
    });
    
    // ═══════════════════════════════════════════════════════════════
    // 25 ARMAS NUEVAS
    // ═══════════════════════════════════════════════════════════════
    
    var newWeapons = [
        // === ARMAS FÍSICAS ===
        {id:'wpn_shortsword',name:'Espada Corta',damage:'1d6',icon:'🗡️',value:25,rarity:'common',weight:2,magic:false,desc:'Versátil y ligera.'},
        {id:'wpn_longsword',name:'Espada Larga',damage:'1d8',icon:'⚔️',value:50,rarity:'rare',weight:3,magic:false,desc:'Alcance superior.'},
        {id:'wpn_greatsword',name:'Mandoble',damage:'2d6',icon:'⚔️',value:100,rarity:'epic',weight:6,magic:false,desc:'Daño devastador.'},
        {id:'wpn_rapier',name:'Estoque',damage:'1d6',icon:'🤺',value:45,rarity:'rare',weight:1,magic:false,desc:'Rápida y precisa.'},
        {id:'wpn_scimitar',name:'Cimitarra',damage:'1d6',icon:'🔪',value:40,rarity:'rare',weight:2,magic:false,desc:'Hoja curva mortal.'},
        {id:'wpn_battleaxe',name:'Hacha de Batalla',damage:'1d10',icon:'🪓',value:60,rarity:'rare',weight:5,magic:false,desc:'Poder bruto.'},
        {id:'wpn_warhammer',name:'Martillo de Guerra',damage:'1d10',icon:'🔨',value:65,rarity:'rare',weight:6,magic:false,desc:'Aplasta armaduras.'},
        {id:'wpn_mace',name:'Maza',damage:'1d6',icon:'⚒️',value:30,rarity:'common',weight:4,magic:false,desc:'Contundente.'},
        {id:'wpn_flail',name:'Mangual',damage:'1d8',icon:'⛓️',value:45,rarity:'rare',weight:4,magic:false,desc:'Difícil de bloquear.'},
        {id:'wpn_spear',name:'Lanza',damage:'1d8',icon:'🔱',value:35,rarity:'common',weight:3,magic:false,desc:'Mantén distancia.'},
        {id:'wpn_halberd',name:'Alabarda',damage:'1d10',icon:'🔱',value:70,rarity:'rare',weight:5,magic:false,desc:'Versátil y letal.'},
        {id:'wpn_bow',name:'Arco Largo',damage:'1d8',icon:'🏹',value:55,rarity:'rare',weight:2,magic:false,desc:'Ataque a distancia.'},
        {id:'wpn_crossbow',name:'Ballesta',damage:'1d10',icon:'🎯',value:75,rarity:'rare',weight:4,magic:false,desc:'Penetra armaduras.'},
        {id:'wpn_katana',name:'Katana',damage:'1d10',icon:'⚔️',value:90,rarity:'epic',weight:2,magic:false,desc:'Hoja perfecta.'},
        {id:'wpn_club',name:'Garrote',damage:'1d4',icon:'🪵',value:5,rarity:'common',weight:3,magic:false,desc:'Simple pero efectivo.'},
        {id:'wpn_whip',name:'Látigo',damage:'1d4',icon:'〰️',value:20,rarity:'common',weight:1,magic:false,desc:'Largo alcance.'},
        {id:'wpn_trident',name:'Tridente',damage:'1d8',icon:'🔱',value:55,rarity:'rare',weight:3,magic:false,desc:'Arma de Poseidón.'},
        
        // === ARMAS MÁGICAS ===
        {id:'wpn_staff_fire',name:'Bastón de Fuego',damage:'1d6',icon:'🔥',value:80,rarity:'rare',weight:2,magic:true,manaBonus:15,effect:'fire',desc:'Quema al enemigo.'},
        {id:'wpn_staff_ice',name:'Bastón de Hielo',damage:'1d6',icon:'❄️',value:80,rarity:'rare',weight:2,magic:true,manaBonus:15,effect:'ice',desc:'30% de congelar.'},
        {id:'wpn_staff_thunder',name:'Bastón del Trueno',damage:'1d8',icon:'⚡',value:100,rarity:'epic',weight:2,magic:true,manaBonus:20,desc:'Poder eléctrico.'},
        {id:'wpn_staff_nature',name:'Bastón de Naturaleza',damage:'1d4',icon:'🌿',value:70,rarity:'rare',weight:1,magic:true,manaBonus:25,desc:'Conexión natural.'},
        {id:'wpn_staff_dark',name:'Bastón Oscuro',damage:'1d10',icon:'🌑',value:120,rarity:'epic',weight:3,magic:true,manaBonus:10,desc:'Poder de las sombras.'},
        {id:'wpn_staff_arcane',name:'Bastón Arcano Superior',damage:'1d8',icon:'🔮',value:150,rarity:'legendary',weight:2,magic:true,manaBonus:30,desc:'Máximo poder mágico.'},
        {id:'wpn_wand',name:'Varita Mágica',damage:'1d4',icon:'✨',value:40,rarity:'common',weight:0,magic:true,manaBonus:10,desc:'Para principiantes.'},
        {id:'wpn_orb',name:'Orbe de Poder',damage:'1d6',icon:'🔮',value:90,rarity:'epic',weight:1,magic:true,manaBonus:20,desc:'Canaliza energía.'}
    ];
    
    newWeapons.forEach(function(wpn) {
        wpn.fromPlugin = true;
        if (!Data.weapons.find(function(w) { return w.id === wpn.id; })) {
            Data.weapons.push(wpn);
        }
    });
    
    // ═══════════════════════════════════════════════════════════════
    // 12 ARMADURAS NUEVAS
    // ═══════════════════════════════════════════════════════════════
    
    var newArmors = [
        {id:'arm_padded',name:'Armadura Acolchada',defense:1,icon:'👕',value:15,rarity:'common',weight:1,desc:'Ligera protección.'},
        {id:'arm_leather_hard',name:'Cuero Endurecido',defense:2,icon:'🦺',value:35,rarity:'common',weight:2,desc:'Cuero tratado.'},
        {id:'arm_studded',name:'Cuero Tachonado',defense:3,icon:'🦺',value:50,rarity:'rare',weight:3,desc:'Reforzado con metal.'},
        {id:'arm_chainmail',name:'Cota de Malla',defense:4,icon:'⛓️',value:80,rarity:'rare',weight:5,desc:'Anillos de metal.'},
        {id:'arm_scalemail',name:'Armadura de Escamas',defense:4,icon:'🐉',value:90,rarity:'rare',weight:5,desc:'Escamas metálicas.'},
        {id:'arm_breastplate',name:'Coraza',defense:5,icon:'🛡️',value:120,rarity:'epic',weight:4,desc:'Protege el torso.'},
        {id:'arm_halfplate',name:'Media Armadura',defense:6,icon:'🛡️',value:150,rarity:'epic',weight:6,desc:'Equilibrio perfecto.'},
        {id:'arm_fullplate',name:'Armadura Completa',defense:8,icon:'⚔️',value:250,rarity:'legendary',weight:8,desc:'Protección máxima.'},
        {id:'arm_robe_mage',name:'Túnica de Mago',defense:1,icon:'🧥',value:60,rarity:'rare',weight:0,magic:true,manaBonus:20,desc:'+20 maná máximo.'},
        {id:'arm_robe_archmage',name:'Túnica de Archimago',defense:2,icon:'🧙',value:150,rarity:'legendary',weight:0,magic:true,manaBonus:40,desc:'+40 maná máximo.'},
        {id:'arm_dragonhide',name:'Armadura de Dragón',defense:7,icon:'🐲',value:300,rarity:'legendary',weight:4,desc:'Escamas de dragón.'},
        {id:'arm_shadow',name:'Armadura de Sombras',defense:3,icon:'🌑',value:100,rarity:'epic',weight:1,desc:'Casi invisible.'}
    ];
    
    newArmors.forEach(function(arm) {
        arm.fromPlugin = true;
        if (!Data.armors.find(function(a) { return a.id === arm.id; })) {
            Data.armors.push(arm);
        }
    });
    
    // ═══════════════════════════════════════════════════════════════
    // 12 MASCOTAS NUEVAS
    // ═══════════════════════════════════════════════════════════════
    
    var newPets = [
        {id:'pet_cat',name:'Gato Callejero',health:12,damage:'1d4',speed:16,difficulty:18,icon:'🐱',regions:['pueblo','bosque'],desc:'Ágil y sigiloso.'},
        {id:'pet_dog',name:'Perro Fiel',health:18,damage:'1d6',speed:14,difficulty:16,icon:'🐕',regions:['pueblo','camino'],desc:'Leal compañero.'},
        {id:'pet_hawk',name:'Halcón',health:10,damage:'1d6',speed:20,difficulty:22,icon:'🦅',regions:['montana','desierto'],desc:'Vista aguda.'},
        {id:'pet_snake',name:'Serpiente',health:8,damage:'1d4',speed:12,difficulty:20,icon:'🐍',regions:['pantano','desierto'],desc:'Venenosa.'},
        {id:'pet_spider',name:'Araña Domesticada',health:15,damage:'1d6',speed:14,difficulty:24,icon:'🕷️',regions:['mazmorra','pantano'],desc:'Teje telarañas.'},
        {id:'pet_bat',name:'Murciélago',health:8,damage:'1d4',speed:18,difficulty:16,icon:'🦇',regions:['mazmorra','bosque'],desc:'Ecolocalización.'},
        {id:'pet_fox',name:'Zorro Astuto',health:14,damage:'1d4',speed:17,difficulty:20,icon:'🦊',regions:['bosque'],desc:'Astuto y rápido.'},
        {id:'pet_owl',name:'Búho Sabio',health:10,damage:'1d4',speed:15,difficulty:22,icon:'🦉',regions:['bosque','montana'],desc:'Sabio nocturno.'},
        {id:'pet_boar',name:'Jabalí Feroz',health:25,damage:'1d8',speed:11,difficulty:26,icon:'🐗',regions:['bosque'],desc:'Embestida feroz.'},
        {id:'pet_turtle',name:'Tortuga Anciana',health:30,damage:'1d2',speed:6,difficulty:20,icon:'🐢',regions:['pantano'],desc:'Defensa alta.'},
        {id:'pet_raven',name:'Cuervo Oscuro',health:8,damage:'1d4',speed:16,difficulty:18,icon:'🐦‍⬛',regions:['bosque','mazmorra'],desc:'Presagio oscuro.'},
        {id:'pet_phoenix',name:'Fénix Bebé',health:20,damage:'1d10',speed:18,difficulty:30,icon:'🔥',regions:['desierto','montana'],desc:'Renace de cenizas.'}
    ];
    
    newPets.forEach(function(pet) {
        pet.fromPlugin = true;
        if (!Data.pets.find(function(p) { return p.id === pet.id; })) {
            Data.pets.push(pet);
        }
    });
    
    // ═══════════════════════════════════════════════════════════════
    // 15 ENEMIGOS NUEVOS CON DROPS ESPECÍFICOS
    // ═══════════════════════════════════════════════════════════════
    
    var newEnemies = [
        {id:'en_spider',name:'Araña Venenosa',health:10,damage:'1d4',difficulty:8,armor:0,speed:13,icon:'🕷️',effect:'poison',
            loot:[5,15],drops:[{itemId:'mat_silk',chance:60},{itemId:'mat_spider_leg',chance:40},{itemId:'mat_venom',chance:15}],
            regions:['bosque','mazmorra'],canGroup:true,groupMin:2,groupMax:4,groupChance:40,desc:'Pequeña pero mortal.'},
        
        {id:'en_slime',name:'Slime Verde',health:15,damage:'1d4',difficulty:6,armor:0,speed:6,icon:'🟢',
            loot:[3,10],drops:[{itemId:'mat_slime',chance:80},{itemId:'mat_mucus',chance:50}],
            regions:['mazmorra','pantano'],canGroup:true,groupMin:2,groupMax:5,groupChance:50,desc:'Gelatinoso.'},
        
        {id:'en_rat_giant',name:'Rata Gigante',health:8,damage:'1d4',difficulty:6,armor:0,speed:14,icon:'🐀',
            loot:[2,8],drops:[{itemId:'mat_rat_tail',chance:70},{itemId:'food_cheese',chance:10}],
            regions:['mazmorra','pueblo'],canGroup:true,groupMin:3,groupMax:6,groupChance:60,desc:'Plaga de las alcantarillas.'},
        
        {id:'en_bat_swarm',name:'Murciélago',health:6,damage:'1d3',difficulty:7,armor:0,speed:16,icon:'🦇',
            loot:[3,8],drops:[{itemId:'mat_wing',chance:60},{itemId:'mat_bat_fang',chance:40}],
            regions:['mazmorra'],canGroup:true,groupMin:3,groupMax:5,groupChance:70,desc:'Vuela en la oscuridad.'},
        
        {id:'en_skeleton_archer',name:'Esqueleto Arquero',health:12,damage:'1d6',difficulty:10,armor:0,speed:10,icon:'💀',
            loot:[10,20],drops:[{itemId:'mat_bone',chance:70},{itemId:'wpn_bow',chance:5}],
            regions:['mazmorra'],canGroup:true,groupMin:2,groupMax:3,groupChance:30,desc:'Dispara desde lejos.'},
        
        {id:'en_ghost',name:'Fantasma',health:20,damage:'1d6',difficulty:12,armor:0,speed:14,icon:'👻',
            loot:[15,30],drops:[{itemId:'mat_shadow',chance:25},{itemId:'pot_invisibility',chance:5}],
            regions:['mazmorra'],canGroup:false,desc:'Atraviesa paredes.'},
        
        {id:'en_werewolf',name:'Hombre Lobo',health:35,damage:'1d10',difficulty:14,armor:2,speed:15,icon:'🐺',effect:'bleed',
            loot:[25,50],drops:[{itemId:'mat_fur',chance:50},{itemId:'mat_fang',chance:40},{itemId:'mat_wolf_pelt',chance:30}],
            regions:['bosque'],canGroup:false,desc:'Bestia de la noche.'},
        
        {id:'en_ogre',name:'Ogro',health:50,damage:'2d6',difficulty:13,armor:2,speed:7,icon:'👹',
            loot:[30,60],drops:[{itemId:'mat_claw',chance:30},{itemId:'mat_leather',chance:40},{itemId:'wpn_club',chance:10}],
            regions:['montana','pantano'],canGroup:false,desc:'Grande y tonto.'},
        
        {id:'en_harpy',name:'Arpía',health:22,damage:'1d8',difficulty:11,armor:0,speed:16,icon:'🦅',
            loot:[20,40],drops:[{itemId:'mat_feather',chance:50},{itemId:'mat_claw',chance:25}],
            regions:['montana'],canGroup:true,groupMin:2,groupMax:3,groupChance:35,desc:'Grito ensordecedor.'},
        
        {id:'en_minotaur',name:'Minotauro',health:45,damage:'2d8',difficulty:15,armor:3,speed:10,icon:'🐂',
            loot:[40,80],drops:[{itemId:'mat_horn',chance:40},{itemId:'mat_leather',chance:50},{itemId:'wpn_battleaxe',chance:5}],
            regions:['mazmorra'],canGroup:false,desc:'Guardián del laberinto.'},
        
        {id:'en_ice_elemental',name:'Elemental de Hielo',health:30,damage:'1d8',difficulty:13,armor:2,speed:10,icon:'❄️',effect:'ice',
            loot:[25,50],drops:[{itemId:'mat_frost',chance:60},{itemId:'mat_crystal',chance:20},{itemId:'gem_sapphire',chance:5}],
            regions:['montana'],canGroup:false,desc:'Frío mortal. 30% de congelar.'},
        
        {id:'en_fire_elemental',name:'Elemental de Fuego',health:30,damage:'1d10',difficulty:13,armor:1,speed:12,icon:'🔥',effect:'fire',
            loot:[25,50],drops:[{itemId:'mat_ember',chance:60},{itemId:'mat_crystal',chance:20},{itemId:'gem_ruby',chance:5}],
            regions:['desierto'],canGroup:false,desc:'Calor abrasador.'},
        
        {id:'en_vampire',name:'Vampiro',health:40,damage:'1d8',difficulty:14,armor:1,speed:14,icon:'🧛',
            loot:[35,70],drops:[{itemId:'mat_fang',chance:50},{itemId:'mat_shadow',chance:30},{itemId:'book_spell',chance:5}],
            regions:['mazmorra'],canGroup:false,desc:'Drena vida.'},
        
        {id:'en_dragon_young',name:'Dragón Joven',health:60,damage:'2d8',difficulty:16,armor:4,speed:12,icon:'🐲',effect:'fire',
            loot:[60,120],drops:[{itemId:'mat_scale',chance:50},{itemId:'gem_ruby',chance:10},{itemId:'mat_heart',chance:20}],
            regions:['montana'],canGroup:false,desc:'Todavía peligroso.'},
        
        {id:'en_giant_crab',name:'Cangrejo Gigante',health:35,damage:'1d10',difficulty:12,armor:5,speed:8,icon:'🦀',
            loot:[20,45],drops:[{itemId:'mat_shell',chance:70},{itemId:'food_fish',chance:30},{itemId:'mat_pearl',chance:10}],
            regions:['pantano'],canGroup:false,desc:'Pinzas aplastantes.'}
    ];
    
    newEnemies.forEach(function(enemy) {
        enemy.fromPlugin = true;
        if (!Data.enemies.find(function(e) { return e.id === enemy.id; })) {
            Data.enemies.push(enemy);
        }
    });
    
    // ═══════════════════════════════════════════════════════════════
    // HECHIZOS NUEVOS (con efecto de hielo)
    // ═══════════════════════════════════════════════════════════════
    
    var newSpells = [
        {id:'sp_ice_ray',name:'Rayo de Hielo',damage:'1d8',cost:4,icon:'❄️',effect:'ice',desc:'30% de congelar al enemigo.'},
        {id:'sp_lightning',name:'Relámpago',damage:'2d6',cost:5,icon:'⚡',effect:null,desc:'Daño eléctrico devastador.'},
        {id:'sp_meteor',name:'Meteoro',damage:'3d6',cost:10,icon:'☄️',effect:'fire',desc:'Destrucción masiva.'},
        {id:'sp_drain',name:'Drenar Vida',damage:'1d6',cost:4,icon:'💜',effect:null,desc:'Roba HP al enemigo.'},
        {id:'sp_blizzard',name:'Ventisca',damage:'2d4',cost:6,icon:'🌨️',effect:'ice',desc:'Hielo en área.'}
    ];
    
    if (!Data.spells) Data.spells = [];
    newSpells.forEach(function(spell) {
        spell.fromPlugin = true;
        if (!Data.spells.find(function(s) { return s.id === spell.id; })) {
            Data.spells.push(spell);
        }
    });
    
    console.log('📦 Plugin data inyectada:');
    console.log('   Items: +' + newItems.length);
    console.log('   Armas: +' + newWeapons.length);
    console.log('   Armaduras: +' + newArmors.length);
    console.log('   Mascotas: +' + newPets.length);
    console.log('   Enemigos: +' + newEnemies.length);
    console.log('   Hechizos: +' + newSpells.length);
}

// ═══════════════════════════════════════════════════════════════════
// ITEMS ESPECIALES CON EFECTOS ACTIVOS
// ═══════════════════════════════════════════════════════════════════

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
                Combat.log('<span class="log-heal">🔮 +1 HP (regeneración)</span>');
            }
        }
    }
});

Plugins.registerItem({
    id: 'sword_vampire',
    name: 'Espada Vampírica',
    icon: '🗡️',
    damage: '1d8',
    weight: 3,
    value: 200,
    rarity: 'legendary',
    magic: false,
    desc: 'Roba 20% del daño como vida.',
    onDealDamage: function(attacker, target, damage) {
        var stolen = Math.max(1, Math.floor(damage * 0.2));
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + stolen);
        if (typeof Combat !== 'undefined') {
            Combat.log('<span class="log-heal">🩸 +' + stolen + ' HP vampírico</span>');
        }
        return damage;
    }
});

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
                Combat.log('<span class="log-damage">🌵 ' + reflected + ' daño reflejado</span>');
            }
        }
        return damage;
    }
});

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

// ═══════════════════════════════════════════════════════════════════
// PLUGIN: Sistema de Combo
// ═══════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════
// PLUGIN: Sistema de Congelación (Efecto Hielo)
// ═══════════════════════════════════════════════════════════════════

Plugins.register({
    id: 'freeze_system',
    name: 'Sistema de Congelación',
    
    // Hook cuando se aplica efecto de hielo (30% de congelar)
    onEffectApply: function(target, effectType) {
        if (effectType === 'ice' && Math.random() < 0.30) {
            if (!target.frozen) {
                target.frozen = true;
                target.frozenTurns = 1;
                if (typeof Combat !== 'undefined') {
                    Combat.log('<span style="color:#00BFFF;font-weight:bold">❄️ ¡' + target.name + ' CONGELADO! Pierde su próximo turno</span>');
                }
                return true;
            }
        }
        return false;
    }
});

// Inyectar datos cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        injectPluginData();
    });
} else {
    injectPluginData();
}

// Log de inicialización
console.log('🎮 RPG Plugins v12 cargado');
console.log('   Items especiales: ' + Object.keys(Plugins.specialItems).length);
console.log('   Efectos custom: ' + Object.keys(Plugins.customEffects).length);
console.log('   Plugins activos: ' + Plugins.registry.length);
