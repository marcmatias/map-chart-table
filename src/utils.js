export function getRandom(list) {
  return list[Math.floor((Math.random()*list.length))];
}

export function getColor(percentage) {
 if (percentage < 20) {
    // First range: from 0 to 19
    const initialColor = [178, 203, 176];
    const finalColor = [116, 177, 182];
    const intervalPercentage = percentage / 20;
    return interpolateColors(initialColor, finalColor, intervalPercentage);
  } else if (percentage < 40) {
    // Second range: from 20 to 39
    const initialColor = [116, 177, 182];
    const finalColor = [43, 115, 177];
    const intervalPercentage = (percentage - 20) / 20;
    return interpolateColors(initialColor, finalColor, intervalPercentage);
  } else if (percentage < 60) {
    // Third range: from 40 to 59
    const initialColor = [43, 115, 177];
    const finalColor = [23, 93, 137];
    const intervalPercentage = (percentage - 40) / 20;
    return interpolateColors(initialColor, finalColor, intervalPercentage);
  } else if (percentage < 80) {
    // Fourth range: from 60 to 79
    const initialColor = [23, 93, 137];
    const finalColor = [47, 56, 126];
    const intervalPercentage = (percentage - 60) / 20;
    return interpolateColors(initialColor, finalColor, intervalPercentage);
  } else {
    // Fifth range: from 80 to 100
    const initialColor = [47, 56, 126];
    const finalColor = [13, 0, 161];
    const intervalPercentage = (percentage - 80) / 20;
    return interpolateColors(initialColor, finalColor, intervalPercentage);
  }
}

function interpolateColors(initialColor, finalColor, intervalPercentage) {
  const r = Math.round(initialColor[0] + (finalColor[0] - initialColor[0]) * intervalPercentage);
  const g = Math.round(initialColor[1] + (finalColor[1] - initialColor[1]) * intervalPercentage);
  const b = Math.round(initialColor[2] + (finalColor[2] - initialColor[2]) * intervalPercentage);
  return `rgb(${r}, ${g}, ${b})`;
}

export function selectElement(name, options, selected) {
  const result = [];
  for (const option of options) {
    result.push(`<option value="${option}" ${option == selected ? 'selected' : '' }>${option}</option>`);
  }
  const div = document.createElement("div");

  div.innerHTML = `
    <div class="mct__selects-section">
      <div class="mct-select">
        <label class="mct-select__label" for="${name}" class="text-xs">${name.charAt(0).toUpperCase() + name.slice(1)}</label>
        <select class="mct-select__element mct-select__${name}" name="${name}" id="${name}">
          ${result.join("")}
        </select>
      </div>
    </div>`;
  return div;
}
