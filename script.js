// ======================================================
// DEIRA DUBAI WEBGIS - FIXED SCRIPT
// ======================================================

// ======================
// MAP INITIALIZATION
// ======================

const map = L.map('map', {
    zoomControl: false
}).setView([25.2653, 55.3216], 13);

// ======================
// BASEMAP
// ======================

L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '© OpenStreetMap Contributors'
    }
).addTo(map);

// ======================
// SCALE CONTROL
// ======================

L.control.scale().addTo(map);

// ======================
// LAYER GROUPS
// ======================

const landUseGroup = L.layerGroup().addTo(map);
const facilityGroup = L.layerGroup().addTo(map);

// ======================
// HTML ELEMENTS
// ======================

const featureInfo =
    document.getElementById('info-details-view');

const emptyState =
    document.getElementById('info-empty-state');

const featureTitle =
    document.getElementById('info-feature-title');

const table =
    document.getElementById('info-attributes-table');

const loadingOverlay =
    document.getElementById('loading-overlay');

const liveCoords =
    document.getElementById('live-coords');

// ======================
// CLEAR SELECTION
// ======================

document.getElementById(
    'info-clear-btn'
).addEventListener('click', () => {

    featureInfo.classList.add('hidden');
    emptyState.classList.remove('hidden');

});

// ======================
// LAND USE STYLE
// ======================

function getLandUseStyle(feature) {

    return {
        color: '#ff007f',
        weight: 2,
        fillColor: '#ff80ab',
        fillOpacity: 0.45
    };

}

// ======================
// SHOW FEATURE INFO
// ======================

function showFeatureInfo(properties) {

    emptyState.classList.add('hidden');
    featureInfo.classList.remove('hidden');

    featureTitle.innerHTML =
        properties.name ||
        properties.NAME ||
        'GIS Feature';

    table.innerHTML = '';

    for (let key in properties) {

        const row = `
        <tr>
            <th>${key}</th>
            <td>${properties[key]}</td>
        </tr>
        `;

        table.innerHTML += row;
    }

}

// ======================
// LOADING HANDLER
// ======================

function hideLoader() {

    setTimeout(() => {

        loadingOverlay.style.opacity = '0';

        setTimeout(() => {

            loadingOverlay.style.display = 'none';

        }, 500);

    }, 1000);

}

// ======================
// ERROR HANDLER
// ======================

function showError(message) {

    console.error(message);

    const errorBox =
        document.getElementById(
            'loader-error-message'
        );

    errorBox.innerHTML = message;

}

// ======================
// LOAD LAND USE
// ======================

fetch('./data/landuse.geojson')

    .then(response => {

        if (!response.ok) {
            throw new Error(
                'Land Use GeoJSON gagal dimuat'
            );
        }

        return response.json();

    })
    .then(data => {

        console.log(data);

        document.getElementById(
            'stat-landuse'
        ).innerHTML = data.features.length;

        const landUse = L.geoJSON(data, {

            style: getLandUseStyle,

            onEachFeature: (feature, layer) => {

                layer.on({

                    mouseover: e => {

                        e.target.setStyle({
                            weight: 4,
                            color: '#ffffff'
                        });

                    },

                    mouseout: e => {

                        landUse.resetStyle(e.target);

                    },

                    click: () => {

                        showFeatureInfo(
                            feature.properties
                        );

                        layer.bindPopup(`
                            <h4>Land Use</h4>
                            <p>
                                ${feature.properties.name || '-'}
                            </p>
                        `).openPopup();

                        map.fitBounds(
                            layer.getBounds()
                        );

                    }

                });

            }

        });

        landUseGroup.addLayer(landUse);

    })

    .catch(error => {

        showError(error.message);

    });

// ======================
// LOAD FACILITIES
// ======================

fetch('data/public_facilities.geojson')

    .then(response => {

        if (!response.ok) {
            throw new Error(
                'Public Facilities GeoJSON gagal dimuat'
            );
        }

        return response.json();

    })

    .then(data => {

        document.getElementById(
            'stat-facilities'
        ).innerHTML = data.features.length;

        const facilities = L.geoJSON(data, {

            pointToLayer: (feature, latlng) => {

                return L.circleMarker(latlng, {

                    radius: 7,
                    fillColor: '#ff007f',
                    color: '#ffffff',
                    weight: 2,
                    fillOpacity: 1

                });

            },

            onEachFeature: (feature, layer) => {

                layer.on({

                    mouseover: e => {

                        e.target.setStyle({
                            radius: 10
                        });

                    },

                    mouseout: e => {

                        e.target.setStyle({
                            radius: 7
                        });

                    },

                    click: () => {

                        showFeatureInfo(
                            feature.properties
                        );

                        layer.bindPopup(`
                            <h4>Public Facility</h4>
                            <p>
                                ${feature.properties.name || '-'}
                            </p>
                        `).openPopup();

                        map.setView(
                            layer.getLatLng(),
                            16
                        );

                    }

                });

            }

        });

        facilityGroup.addLayer(facilities);

        // HIDE LOADER
        hideLoader();

    })

    .catch(error => {

        console.error('FETCH ERROR:', error);

        alert(error.message);

        showError(error.message);

    });

// ======================
// TOGGLE LAND USE
// ======================

document.getElementById(
    'toggle-landuse'
).addEventListener('change', e => {

    if (e.target.checked) {

        map.addLayer(landUseGroup);

    } else {

        map.removeLayer(landUseGroup);

    }

});

// ======================
// TOGGLE FACILITIES
// ======================

document.getElementById(
    'toggle-facilities'
).addEventListener('change', e => {

    if (e.target.checked) {

        map.addLayer(facilityGroup);

    } else {

        map.removeLayer(facilityGroup);

    }

});

// ======================
// CUSTOM TOOLBAR
// ======================

// ZOOM IN
document.getElementById(
    'btn-zoom-in'
).onclick = () => {

    map.zoomIn();

};

// ZOOM OUT
document.getElementById(
    'btn-zoom-out'
).onclick = () => {

    map.zoomOut();

};

// RESET VIEW
document.getElementById(
    'btn-reset-view'
).onclick = () => {

    map.setView(
        [25.2653, 55.3216],
        13
    );

};

// SIDEBAR TOGGLE
document.getElementById(
    'btn-toggle-sidebar'
).onclick = () => {

    document.getElementById(
        'dashboard-sidebar'
    ).classList.toggle('collapsed');

    // Trigger Leaflet map resize after sidebar transition finishes
    setTimeout(() => {
        map.invalidateSize({ animate: true });
    }, 360);

};

// MOBILE CLOSE
document.getElementById(
    'mobile-sidebar-close'
).onclick = () => {

    document.getElementById(
        'dashboard-sidebar'
    ).classList.add('collapsed');

    // Trigger Leaflet map resize after sidebar transition finishes
    setTimeout(() => {
        map.invalidateSize({ animate: true });
    }, 360);

};

// ======================
// LIVE COORDINATES
// ======================

map.on('mousemove', e => {

    const lat =
        e.latlng.lat.toFixed(5);

    const lng =
        e.latlng.lng.toFixed(5);

    liveCoords.innerHTML =
        `Lat: ${lat}, Lng: ${lng}`;

});

// ======================
// FULLSCREEN BUTTON
// ======================

document.getElementById(
    'btn-fullscreen'
).onclick = () => {

    if (!document.fullscreenElement) {

        document.documentElement.requestFullscreen();

    } else {

        document.exitFullscreen();

    }

};

// ======================
// LOCATE USER
// ======================

document.getElementById(
    'btn-locate'
).onclick = () => {

    map.locate({
        setView: true,
        maxZoom: 15
    });

};

map.on('locationfound', e => {

    L.circleMarker(e.latlng, {

        radius: 8,
        fillColor: '#00e5ff',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1

    }).addTo(map);

});

map.on('locationerror', () => {

    alert(
        'Lokasi tidak dapat diakses'
    );

});

// ======================
// RESIZE FIX
// ======================

setTimeout(() => {

    map.invalidateSize();

}, 500);

// ======================
// LEGEND ACCORDION
// ======================

function setupLegendAccordion(headerId, listId) {
    const header = document.getElementById(headerId);
    const list = document.getElementById(listId);
    if (header && list) {
        header.onclick = () => {
            header.classList.toggle('collapsed');
            list.classList.toggle('collapsed');
        };
    }
}

setupLegendAccordion('legend-header-landuse', 'legend-list-landuse');
setupLegendAccordion('legend-header-facilities', 'legend-list-facilities');

// ======================
// DATA COMPOSITION CHART
// ======================

function initCompositionChart() {
    const ctx = document.getElementById('datasetCompositionChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Public Facilities (40%)', 'Land Use (60%)'],
            datasets: [{
                data: [40, 60],
                backgroundColor: [
                    '#ff007f', // Accent Primary (Pink)
                    '#d81b60'  // Accent Secondary (Magenta)
                ],
                borderColor: 'rgba(26, 26, 38, 0.8)', // Border matching glass card background
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#bdc3c7',
                        font: {
                            family: 'Outfit',
                            size: 11
                        },
                        boxWidth: 12,
                        padding: 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return ` ${context.label.split(' ')[0]}: ${context.raw}%`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

// Initialize chart when content is loaded
document.addEventListener('DOMContentLoaded', () => {
    initCompositionChart();
});

// Also try running it directly in case DOMContentLoaded has already fired
initCompositionChart();