const placeholder = document.getElementById('dropzone-placeholder')

export const showPlaceholder = (ev: DragEvent) => {
  if (placeholder) {
    placeholder.style.display = 'block'
    placeholder.style.transform = `translate(${ev.clientX - 100}px,${
      ev.clientY - 50
    }px)`
  }
}

export const hidePlacehodler = (ev: DragEvent) => {
  if (placeholder) {
    placeholder.style.display = 'none'
  }
}
