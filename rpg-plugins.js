/**
 * RPG Editor-Plugin Integration System
 * Integración entre el editor y el sistema de plugins
 * 
 * ARQUITECTURA:
 * - Los plugins definen COMPORTAMIENTO (lógica, eventos, efectos)
 * - El editor gestiona DATOS CONFIGURABLES (nombres, valores, descripciones)
 * - El runtime COMBINA ambos en tiempo de ejecución
 */

const EditorPluginBridge = {
    // Almacenamiento de datos editables separado de la lógica
    editableData: {},
    
    // Inicializar el puente
    init() {
        this.syncPluginItems();
        this.setupEditorHooks();
        console.log('🔌 Editor-Plugin Bridge inicializado');
    },
    
    /**
     * Sincroniza ítems del sistema de plugins con datos editables
     * Extrae solo las propiedades configurables
     */
    syncPluginItems() {
        if (!window.Plugins) {
            console.warn('Sistema de plugins no encontrado');
            return;
        }
        
        Object.entries(Plugins.specialItems).forEach(([id, plugin]) => {
            // Si no existe data editable, crearla desde el plugin
            if (!this.editableData[id]) {
                this.editableData[id] = this.extractEditableData(plugin);
            }
        });
        
        console.log(`📦 ${Object.keys(this.editableData).length} ítems sincronizados`);
    },
    
    /**
     * Extrae solo los datos editables de un plugin
     * La lógica (funciones) permanece en el plugin
     */
    extractEditableData(plugin) {
        return {
            id: plugin.id,
            name: plugin.name,
            icon: plugin.icon,
            type: plugin.type || 'weapon',
            desc: plugin.desc || '',
            value: plugin.value || 0,
            rarity: plugin.rarity || 'common',
            
            // Propiedades de arma
            damage: plugin.damage,
            weight: plugin.weight,
            
            // Propiedades de armadura
            defense: plugin.defense,
            
            // Propiedades configurables extras
            speedBonus: plugin.speedBonus,
            critBonus: plugin.critBonus,
            
            // Metadatos
            passive: plugin.passive || false,
            consumable: plugin.type === 'potion',
            
            // Referencia al plugin (no editable)
            _pluginRef: plugin.id
        };
    },
    
    /**
     * Obtiene un ítem completo (datos + comportamiento)
     * Esta es la función que usa el motor del juego
     */
    getItem(id) {
        const data = this.editableData[id];
        const plugin = Plugins.specialItems[id];
        
        if (!data && !plugin) return null;
        
        // Combinar datos editables con comportamiento del plugin
        return {
            ...(data || {}),
            ...(plugin || {}),
            // Los datos editables sobrescriben propiedades básicas
            name: data?.name || plugin?.name,
            icon: data?.icon || plugin?.icon,
            desc: data?.desc || plugin?.desc,
            value: data?.value ?? plugin?.value,
            rarity: data?.rarity || plugin?.rarity,
            damage: data?.damage || plugin?.damage,
            defense: data?.defense || plugin?.defense
        };
    },
    
    /**
     * Obtiene todos los ítems para el editor
     */
    getAllItemsForEditor() {
        const items = [];
        
        // Combinar ítems de plugins y datos editables
        const allIds = new Set([
            ...Object.keys(Plugins.specialItems || {}),
            ...Object.keys(this.editableData)
        ]);
        
        allIds.forEach(id => {
            const item = this.getItem(id);
            if (item) {
                items.push({
                    ...item,
                    isPlugin: !!Plugins.specialItems[id],
                    isEditable: true
                });
            }
        });
        
        return items;
    },
    
    /**
     * Actualiza datos editables de un ítem
     * NO modifica el comportamiento del plugin
     */
    updateItemData(id, updates) {
        if (!this.editableData[id]) {
            this.editableData[id] = { id };
        }
        
        // Solo actualizar propiedades permitidas
        const allowedProps = [
            'name', 'icon', 'desc', 'value', 'rarity',
            'damage', 'defense', 'weight', 'type',
            'speedBonus', 'critBonus'
        ];
        
        allowedProps.forEach(prop => {
            if (updates[prop] !== undefined) {
                this.editableData[id][prop] = updates[prop];
            }
        });
        
        // Guardar en localStorage
        this.saveToStorage();
        
        console.log(`💾 Ítem ${id} actualizado`);
        return this.getItem(id);
    },
    
    /**
     * Crea un nuevo ítem editable (sin comportamiento de plugin)
     */
    createNewItem(data) {
        const id = data.id || `item_${Date.now()}`;
        this.editableData[id] = {
            id,
            name: data.name || 'Nuevo Ítem',
            icon: data.icon || '⚔️',
            type: data.type || 'weapon',
            desc: data.desc || '',
            value: data.value || 0,
            rarity: data.rarity || 'common',
            damage: data.damage,
            defense: data.defense,
            weight: data.weight || 1
        };
        
        this.saveToStorage();
        return this.editableData[id];
    },
    
    /**
     * Elimina un ítem editable
     * Los ítems de plugins solo se ocultan, no se eliminan
     */
    deleteItem(id) {
        if (Plugins.specialItems[id]) {
            // Marcar como oculto en lugar de eliminar
            this.editableData[id] = this.editableData[id] || {};
            this.editableData[id]._hidden = true;
        } else {
            delete this.editableData[id];
        }
        this.saveToStorage();
    },
    
    /**
     * Configurar hooks del editor
     */
    setupEditorHooks() {
        // Hook para cuando el editor cargue
        window.addEventListener('editor:loaded', () => {
            this.loadFromStorage();
            this.syncPluginItems();
        });
        
        // Hook para cuando se guarde el juego
        window.addEventListener('game:save', () => {
            this.saveToStorage();
        });
    },
    
    /**
     * Guardar datos editables en localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('rpg_editable_items', JSON.stringify(this.editableData));
        } catch (e) {
            console.error('Error guardando datos editables:', e);
        }
    },
    
    /**
     * Cargar datos editables desde localStorage
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('rpg_editable_items');
            if (saved) {
                this.editableData = JSON.parse(saved);
                console.log('📁 Datos editables cargados');
            }
        } catch (e) {
            console.error('Error cargando datos editables:', e);
        }
    },
    
    /**
     * Obtiene metadatos sobre un ítem para el editor
     */
    getItemMetadata(id) {
        const plugin = Plugins.specialItems[id];
        
        return {
            hasLogic: !!plugin,
            hasCustomEffects: !!(plugin?.onUse || plugin?.onEquip || plugin?.onTurnStart),
            editableProps: this.getEditableProps(id),
            behaviorDescription: this.getBehaviorDescription(plugin)
        };
    },
    
    /**
     * Lista las propiedades editables de un ítem
     */
    getEditableProps(id) {
        const item = this.getItem(id);
        const props = [];
        
        if (item) {
            if (item.type === 'weapon' || !item.type) {
                props.push('damage', 'weight');
            }
            if (item.type === 'armor') {
                props.push('defense', 'weight');
            }
            if (item.type === 'accessory') {
                props.push('speedBonus', 'critBonus');
            }
            props.push('name', 'icon', 'desc', 'value', 'rarity');
        }
        
        return props;
    },
    
    /**
     * Genera descripción del comportamiento del plugin
     */
    getBehaviorDescription(plugin) {
        if (!plugin) return null;
        
        const behaviors = [];
        
        if (plugin.onUse) behaviors.push('🎯 Efecto al usar');
        if (plugin.onEquip) behaviors.push('⚡ Efecto al equipar');
        if (plugin.onTurnStart) behaviors.push('🔄 Efecto cada turno');
        if (plugin.onDealDamage) behaviors.push('⚔️ Modifica daño causado');
        if (plugin.onTakeDamage) behaviors.push('🛡️ Modifica daño recibido');
        if (plugin.passive) behaviors.push('✨ Efecto pasivo');
        
        return behaviors.length > 0 ? behaviors.join(', ') : null;
    }
};

/**
 * Adaptador para el editor existente
 * Conecta el editor con el sistema de plugins
 */
const EditorAdapter = {
    /**
     * Obtiene todos los ítems para mostrar en el editor
     */
    getWeapons() {
        return EditorPluginBridge.getAllItemsForEditor()
            .filter(item => !item.type || item.type === 'weapon');
    },
    
    getArmors() {
        return EditorPluginBridge.getAllItemsForEditor()
            .filter(item => item.type === 'armor');
    },
    
    getAccessories() {
        return EditorPluginBridge.getAllItemsForEditor()
            .filter(item => item.type === 'accessory');
    },
    
    getPotions() {
        return EditorPluginBridge.getAllItemsForEditor()
            .filter(item => item.type === 'potion');
    },
    
    getAllItems() {
        return EditorPluginBridge.getAllItemsForEditor();
    },
    
    /**
     * Guarda cambios de un ítem desde el editor
     */
    saveItem(id, data) {
        return EditorPluginBridge.updateItemData(id, data);
    },
    
    /**
     * Crea un nuevo ítem desde el editor
     */
    createItem(data) {
        return EditorPluginBridge.createNewItem(data);
    },
    
    /**
     * Elimina un ítem desde el editor
     */
    deleteItem(id) {
        return EditorPluginBridge.deleteItem(id);
    },
    
    /**
     * Obtiene metadatos para mostrar en el editor
     */
    getItemInfo(id) {
        return EditorPluginBridge.getItemMetadata(id);
    }
};

/**
 * Runtime Integration
 * Conecta el sistema con el motor del juego
 */
const RuntimeIntegration = {
    /**
     * Obtiene un ítem para usar en el juego
     * Combina datos editables con comportamiento del plugin
     */
    getGameItem(id) {
        return EditorPluginBridge.getItem(id);
    },
    
    /**
     * Ejecuta el comportamiento de un ítem
     */
    executeItemBehavior(itemId, event, ...args) {
        const plugin = Plugins.specialItems[itemId];
        if (plugin && typeof plugin[event] === 'function') {
            return plugin[event](...args);
        }
        return null;
    },
    
    /**
     * Verifica si un ítem tiene un comportamiento específico
     */
    hasItemBehavior(itemId, event) {
        const plugin = Plugins.specialItems[itemId];
        return plugin && typeof plugin[event] === 'function';
    }
};

// Inicializar automáticamente cuando se cargue
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        EditorPluginBridge.init();
    });
} else {
    EditorPluginBridge.init();
}

// Exportar para uso global
window.EditorPluginBridge = EditorPluginBridge;
window.EditorAdapter = EditorAdapter;
window.RuntimeIntegration = RuntimeIntegration;

console.log('✅ Editor-Plugin Integration cargado');

/**
 * EJEMPLO DE USO EN EL EDITOR:
 * 
 * // Obtener todos los ítems para mostrar
 * const weapons = EditorAdapter.getWeapons();
 * 
 * // Actualizar un ítem
 * EditorAdapter.saveItem('sword_vampire', {
 *     name: 'Espada Vampírica Mejorada',
 *     damage: '1d10',
 *     value: 250
 * });
 * 
 * // Crear nuevo ítem
 * EditorAdapter.createItem({
 *     id: 'sword_fire',
 *     name: 'Espada de Fuego',
 *     type: 'weapon',
 *     damage: '1d8',
 *     icon: '🔥'
 * });
 * 
 * // Obtener info del ítem
 * const info = EditorAdapter.getItemInfo('sword_vampire');
 * console.log(info.behaviorDescription); // "⚔️ Modifica daño causado"
 */

/**
 * EJEMPLO DE USO EN EL JUEGO:
 * 
 * // Obtener ítem con datos y comportamiento
 * const item = RuntimeIntegration.getGameItem('sword_vampire');
 * 
 * // Usar el ítem
 * if (RuntimeIntegration.hasItemBehavior(item.id, 'onUse')) {
 *     RuntimeIntegration.executeItemBehavior(item.id, 'onUse', player, item);
 * }
 */
