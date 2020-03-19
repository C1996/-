/**
 * 选择排序
 * @param {Array} arr 
 * 在未排序序列中找到最小的元素，放在序列起始位置
 * 再从剩余的未排序元素中找到最小元素，然后放到已排序序列末尾
 */
function selectionSort(arr) {
  var len = arr.length;
  var minIndex, temp;
  for (var i = 0; i < len - 1; i++) {
    minIndex = i;
    for (var j = i + 1; j < len; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j
      }
    }
    temp = arr[i];
    arr[i] = arr[minIndex];
    arr[minIndex] = temp;
  }
  return arr;
}

var val = selectionSort([10, 9, 5, 3, 6, 2, 0]);
console.log(val);