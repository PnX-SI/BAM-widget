function hackForMapContainerResize(map, mapDomId) {
    const resizeObserver = new ResizeObserver((entries) => {
        // This will be called upon every element resize
        for (let entry of entries) {
            if (entry.target.id === mapDomId) {
                map.invalidateSize();
            }
        }
    });
    resizeObserver.observe(document.getElementById(mapDomId));
}

export { hackForMapContainerResize };
