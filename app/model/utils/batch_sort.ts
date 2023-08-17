type BatchCategory = "gen"; // Define possible category values

type BatchWithCategory = {
  category: BatchCategory;
  number: number;
};

function parseBatch(batch: string): BatchWithCategory {
  const [category, numberStr] = batch.split("_");
  return {
    category: category as BatchCategory,
    number: parseInt(numberStr.slice(0, -1)),
  };
}
export function batchSort(a: string, b: string) {
  const batchA = parseBatch(a);
  const batchB = parseBatch(b);

  if (batchA.category === batchB.category) {
    return batchA.number - batchB.number;
  } else {
    return batchA.category < batchB.category ? -1 : 1;
  }
}
