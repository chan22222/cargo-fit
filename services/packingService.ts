import { CargoItem, ContainerSpec, PackedItem, PackingResult } from '../types';

// 시각화를 위한 간단한 "First Fit" 패킹 알고리즘
// 실제 환경에서는 복잡한 Bin Packing Problem 솔버를 사용
export const calculatePacking = (
  container: ContainerSpec,
  cargoList: CargoItem[]
): PackingResult => {
  const packedItems: PackedItem[] = [];
  let currentX = 0;
  let currentY = 0;
  let currentZ = 0;
  let maxLineHeight = 0; // Max height in the current row (X-axis sweep)
  let maxLayerLength = 0; // Max length in the current layer (Z-axis sweep)

  // Expand the cargo list into individual items
  const expandedList: { item: CargoItem; uniqueId: string }[] = [];
  cargoList.forEach(item => {
    // 복합 화물은 그대로 유지 (구조 보존)
    if (item.isCompound) {
      for (let i = 0; i < item.quantity; i++) {
        expandedList.push({ item, uniqueId: `${item.id}-${i}` });
      }
    } else {
      for (let i = 0; i < item.quantity; i++) {
        expandedList.push({ item, uniqueId: `${item.id}-${i}` });
      }
    }
  });

  // Sort logic: Pallets first (always at bottom), then Heavy items (Stability), then Largest Volume (Efficiency)
  expandedList.sort((a, b) => {
    const isPalletA = a.item.isCompound || a.item.name.includes('팔레트') || a.item.name.toLowerCase().includes('pallet');
    const isPalletB = b.item.isCompound || b.item.name.includes('팔레트') || b.item.name.toLowerCase().includes('pallet');

    // Primary sort: Pallets first (at the bottom)
    if (isPalletA && !isPalletB) return -1;
    if (!isPalletA && isPalletB) return 1;

    const weightA = a.item.weight || 0;
    const weightB = b.item.weight || 0;

    // Secondary sort: Weight (Descending)
    if (weightB !== weightA) {
      return weightB - weightA;
    }

    // Tertiary sort: Volume (Descending)
    const volA = a.item.dimensions.width * a.item.dimensions.length * a.item.dimensions.height;
    const volB = b.item.dimensions.width * b.item.dimensions.length * b.item.dimensions.height;
    return volB - volA;
  });

  for (const { item, uniqueId } of expandedList) {
    const { width, height, length } = item.dimensions;

    // Check if it fits in current X position
    if (currentX + width > container.width) {
      // Move to next row (Z axis)
      currentX = 0;
      currentZ += maxLayerLength;
      maxLayerLength = 0; // Reset for new row
    }

    // Check if it fits in current Z position
    if (currentZ + length > container.length) {
      // Move to next layer (Y axis)
      currentX = 0;
      currentZ = 0;
      currentY += maxLineHeight;
      maxLineHeight = 0; // Reset for new layer
    }

    // Check if it fits in current Y position (Height)
    if (currentY + height <= container.height) {
      packedItems.push({
        ...item,
        uniqueId,
        weight: item.weight, // Preserve weight
        position: { x: currentX, y: currentY, z: currentZ }
      });

      // Update pointers
      currentX += width;

      // Track max dimensions for row/layer stacking
      if (length > maxLayerLength) maxLayerLength = length;
      if (height > maxLineHeight) maxLineHeight = height;
    } else {
      // Item doesn't fit in the container at all
      console.warn(`Item ${item.name} could not fit.`);
    }
  }

  // Calculate stats
  const totalVolume = container.width * container.height * container.length;
  const usedVolume = packedItems.reduce((acc, i) => acc + (i.dimensions.width * i.dimensions.height * i.dimensions.length), 0);
  
  return {
    packedItems,
    volumeEfficiency: (usedVolume / totalVolume) * 100,
    totalItems: packedItems.length,
    remainingSpace: totalVolume - usedVolume
  };
};