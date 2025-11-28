<script setup>
    import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
    import L from 'leaflet';
    import { onClickOutside } from '@vueuse/core';
    import { useTemplateRef } from 'vue';

    // Props
    const props = defineProps({
        map: {
            type: Object,
            required: true,
        },
        drawnItems: {
            type: Object,
            required: true,
        },
        deleteLayerButton: {
            type: Boolean,
            default: true,
        },
    });

    // Emits
    const emit = defineEmits(['geometry-created', 'geometry-deleted']);

    // Refs
    const showToolsPanel = ref(false);
    const showActionPanel = ref(false);
    const currentTool = ref(null);
    const toolsPanel = useTemplateRef('toolsPanel');
    // onClickOutside(toolsPanel, (event) => {
    //     if (!toolsPanel.value.contains(event.target) && !isDrawing) {
    //         showToolsPanel.value = false;
    //     }
    // });

    // Variables de l'état de dessin
    let isDrawing = false;
    let tempMarkers = [];
    let tempLine = null;
    let startLatLng = null;
    let tempShape = null;

    // Outils disponibles
    const tools = [
        { id: 'marker', icon: '📍', label: 'Marqueur' },
        { id: 'polyline', icon: '📏', label: 'Ligne' },
        { id: 'polygon', icon: '⬟', label: 'Polygone' },
        { id: 'rectangle', icon: '▭', label: 'Rectangle' },
        { id: 'circle', icon: '⭕', label: 'Cercle' },
    ];

    // Fonction pour basculer le panneau d'outils
    const toggleToolsPanel = () => {
        console.log(currentTool.value);
        if (!currentTool.value) {
            showToolsPanel.value = !showToolsPanel.value;
            showActionPanel.value = false;
        }
    };

    // Sélectionner un outil
    const selectTool = (tool, event) => {
        if (event) event.stopPropagation();
        if (currentTool.value === tool) {
            deactivateTool();
            return;
        }

        activateTool(tool);
    };

    // Activer un outil
    const activateTool = (tool) => {
        deactivateTool();

        currentTool.value = tool;
        props.map.getContainer().style.cursor = 'crosshair';

        showToolsPanel.value = false;
        showActionPanel.value = true;

        if (tool === 'marker') {
            props.map.on('click', onMarkerClick);
        } else if (tool === 'polyline' || tool === 'polygon') {
            props.map.on('click', onPolyClick);
        } else if (tool === 'rectangle' || tool === 'circle') {
            props.map.on('mousedown', onShapeStart);
        }
    };

    // Désactiver l'outil
    const deactivateTool = () => {
        if (!props.map) return;

        props.map.getContainer().style.cursor = '';
        props.map.off('click', onMarkerClick);
        props.map.off('click', onPolyClick);
        props.map.off('mousedown', onShapeStart);
        props.map.off('mousemove', onShapeMove);
        props.map.off('mouseup', onShapeEnd);
        clearDrawing();
        currentTool.value = null;
        isDrawing = false;
        showActionPanel.value = false;
    };

    // Nettoyer les éléments temporaires
    const clearDrawing = () => {
        if (!props.map) return;

        tempMarkers.forEach((m) => props.map.removeLayer(m));
        tempMarkers = [];
        if (tempLine) {
            props.map.removeLayer(tempLine);
            tempLine = null;
        }
        if (tempShape) {
            props.map.removeLayer(tempShape);
            tempShape = null;
        }
    };

    // Émettre un événement de création de géométrie
    const emitGeometryCreated = (layer, layerType) => {
        const eventData = {
            layer: layer,
            layerType: layerType,
        };

        emit('geometry-created', eventData);
    };

    // Marqueur
    const onMarkerClick = (e) => {
        const marker = L.marker(e.latlng).addTo(props.drawnItems);
        emitGeometryCreated(marker, 'marker');
        deactivateTool();
    };

    // Ligne et Polygone
    const onPolyClick = (e) => {
        if (currentTool.value === 'polygon' && tempMarkers.length >= 3) {
            const firstMarker = tempMarkers[0];
            const firstLatLng = firstMarker.getLatLng();

            const firstPoint = props.map.latLngToContainerPoint(firstLatLng);
            const clickPoint = props.map.latLngToContainerPoint(e.latlng);
            const pixelDistance = Math.sqrt(
                Math.pow(firstPoint.x - clickPoint.x, 2) +
                    Math.pow(firstPoint.y - clickPoint.y, 2)
            );

            if (pixelDistance < 15) {
                finishDrawing();
                return;
            }
        }

        const marker = L.circleMarker(e.latlng, {
            radius: 5,
            color: '#2196F3',
            fillColor: '#2196F3',
            fillOpacity: 0.7,
        }).addTo(props.map);

        if (currentTool.value === 'polygon' && tempMarkers.length === 0) {
            marker.setStyle({
                radius: 8,
                color: '#4CAF50',
                fillColor: '#4CAF50',
                weight: 3,
            });

            marker.on('click', (evt) => {
                L.DomEvent.stopPropagation(evt);
                if (tempMarkers.length >= 3) {
                    finishDrawing();
                }
            });
        }

        tempMarkers.push(marker);

        if (tempMarkers.length > 1) {
            const latlngs = tempMarkers.map((m) => m.getLatLng());

            if (tempLine) props.map.removeLayer(tempLine);

            tempLine = L.polyline(latlngs, {
                color: '#2196F3',
                weight: 3,
            }).addTo(props.map);
        }
    };

    // Rectangle et Cercle
    const onShapeStart = (e) => {
        startLatLng = e.latlng;
        isDrawing = true;
        props.map.on('mousemove', onShapeMove);
        props.map.on('mouseup', onShapeEnd);
        props.map.dragging.disable();
    };

    const onShapeMove = (e) => {
        if (!isDrawing) return;

        if (tempShape) props.map.removeLayer(tempShape);

        if (currentTool.value === 'rectangle') {
            const bounds = L.latLngBounds(startLatLng, e.latlng);
            tempShape = L.rectangle(bounds, {
                color: '#2196F3',
                fillColor: '#2196F3',
                fillOpacity: 0.3,
            }).addTo(props.map);
        } else if (currentTool.value === 'circle') {
            const radius = startLatLng.distanceTo(e.latlng);
            tempShape = L.circle(startLatLng, {
                radius: radius,
                color: '#2196F3',
                fillColor: '#2196F3',
                fillOpacity: 0.3,
            }).addTo(props.map);
        }
    };

    const onShapeEnd = (e) => {
        if (!isDrawing) return;

        props.map.dragging.enable();

        if (tempShape) {
            props.map.removeLayer(tempShape);

            let layer;
            if (currentTool.value === 'rectangle') {
                const bounds = L.latLngBounds(startLatLng, e.latlng);
                layer = L.rectangle(bounds, {
                    color: '#2196F3',
                    fillColor: '#2196F3',
                    fillOpacity: 0.3,
                }).addTo(props.drawnItems);
                emitGeometryCreated(layer, 'rectangle');
            } else if (currentTool.value === 'circle') {
                const radius = startLatLng.distanceTo(e.latlng);
                layer = L.circle(startLatLng, {
                    radius: radius,
                    color: '#2196F3',
                    fillColor: '#2196F3',
                    fillOpacity: 0.3,
                }).addTo(props.drawnItems);
                emitGeometryCreated(layer, 'circle');
            }
        }

        deactivateTool();
    };

    // Terminer le dessin
    const finishDrawing = () => {
        if (
            currentTool.value === 'polyline' ||
            currentTool.value === 'polygon'
        ) {
            const minPoints = currentTool.value === 'polygon' ? 3 : 2;
            if (tempMarkers.length >= minPoints) {
                const latlngs = tempMarkers.map((m) => m.getLatLng());

                let layer;
                if (currentTool.value === 'polygon') {
                    layer = L.polygon(latlngs, {
                        color: '#2196F3',
                        fillColor: '#2196F3',
                        fillOpacity: 0.3,
                    }).addTo(props.drawnItems);
                    emitGeometryCreated(layer, 'polygon');
                } else {
                    layer = L.polyline(latlngs, {
                        color: '#2196F3',
                        weight: 3,
                    }).addTo(props.drawnItems);
                    emitGeometryCreated(layer, 'polyline');
                }
            }
        }
        deactivateTool();
    };

    // Annuler le dessin
    const cancelDrawing = () => {
        deactivateTool();
    };

    // Supprimer toutes les géométries
    const deleteAll = () => {
        props.drawnItems.clearLayers();
        emit('geometry-deleted');
        clearDrawing();
    };

    // Nettoyage
    onBeforeUnmount(() => {
        deactivateTool();
    });

    // Exposer les méthodes publiques
    defineExpose({
        deactivateTool,
        clearDrawing,
    });
</script>
<template>
    <div class="draw-control">
        <button class="main-button" @click="toggleToolsPanel">✏️</button>
        <div
            class="tools-panel"
            ref="toolsPanel"
            :class="{ active: showToolsPanel }"
        >
            <button
                class="tool-button"
                v-for="tool in tools"
                :key="tool.id"
                :class="{ active: currentTool === tool.id }"
                @click.stop="selectTool(tool.id)"
            >
                <span class="tool-icon">{{ tool.icon }}</span>
                <span>{{ tool.label }}</span>
            </button>
            <div v-show="props.deleteLayerButton">
                <div class="divider"></div>
                <button class="tool-button" @click.stop="deleteAll">
                    <span class="tool-icon">🗑️</span>
                    <span>Supprimer tout</span>
                </button>
            </div>
        </div>
        <div class="action-panel" :class="{ active: showActionPanel }">
            <button
                class="action-button finish-button"
                @click="finishDrawing"
                title="Terminer"
            >
                <span class="tool-icon">✓</span>
            </button>
            <button
                class="action-button cancel-button"
                @click="cancelDrawing"
                title="Annuler"
            >
                <span class="tool-icon">✕</span>
            </button>
        </div>
    </div>
</template>

<script>
    export default {
        methods: {
            hideToolsPanel(event) {
                if (!this.$el.contains(event.target)) {
                    this.showToolsPanel = false;
                }
            },
        },
    };
</script>
<style scoped>
    .draw-control {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1000;
    }

    .main-button {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border: none;
        border-radius: 50%;
        width: 42px;
        height: 42px;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .main-button:hover {
        background: rgba(255, 255, 255, 1);
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
    }

    .tools-panel {
        position: absolute;
        top: 50px;
        right: 0;
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(12px);
        border-radius: 16px;
        padding: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        display: none;
        flex-direction: column;
        gap: 6px;
        min-width: 200px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .tools-panel.active {
        display: flex;
        opacity: 1;
        transform: translateY(0);
    }

    .tool-button {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: none;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 15px;
        font-weight: 500;
        color: #333;
        position: relative;
        overflow: hidden;
    }

    .tool-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
            135deg,
            rgba(33, 150, 243, 0.1),
            rgba(33, 150, 243, 0.05)
        );
        opacity: 0;
        transition: opacity 0.25s;
    }

    .tool-button:hover::before {
        opacity: 1;
    }

    .tool-button:hover {
        background: rgba(255, 255, 255, 0.95);
        transform: translateX(-3px);
        box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
    }

    .tool-button.active {
        background: #efefef;
        color: white;
        box-shadow: 0 4px 16px rgba(33, 150, 243, 0.4);
        /* transform: translateX(-3px); */
    }

    .tool-button.active::before {
        opacity: 0;
    }

    .tool-icon {
        font-size: 20px;
        width: 26px;
        text-align: center;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
    }

    .divider {
        height: 1px;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 0, 0, 0.1) 20%,
            rgba(0, 0, 0, 0.1) 80%,
            transparent
        );
        margin: 6px 0;
    }

    .action-panel {
        position: absolute;
        top: 70px;
        right: 0;
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(12px);
        border-radius: 16px;
        padding: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        display: none;
        flex-direction: row;
        gap: 8px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .action-panel.active {
        display: flex;
        opacity: 1;
        transform: translateY(0);
    }

    .action-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 22px;
        color: white;
        position: relative;
        overflow: hidden;
    }

    .finish-button {
        background: linear-gradient(135deg, #4caf50, #388e3c);
        box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
    }

    .finish-button:hover {
        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
    }

    .cancel-button {
        background: linear-gradient(135deg, #f44336, #d32f2f);
        box-shadow: 0 4px 16px rgba(244, 67, 54, 0.3);
    }

    .cancel-button:hover {
        box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
    }

    .action-button:active {
        transform: translateY(0);
    }
</style>
