/**
 * 冒泡排序 
 * @param {Array} arr 
 * 比较相邻元素，较大的数会被交换到右边
 * 每一对相邻的元素都重复同样的操作。第一次循环结束后，最大的数会排到最右边
 * 再次循环操作，除了最后一个
 */

function bubbleSort(arr) {
  var len = arr.length;
  for (var i = 0; i < len - 1; i++) {
    for (var j = 0; j < len - 1 - i; j ++) {
      if (arr[j] > arr[j + 1]) {
        var temp = arr[j + 1];
        arr[j + 1] = arr[j];
        arr[j] = temp;
      }
    }
  }
  return arr;
}

var val = bubbleSort([10, 9, 5, 3, 6, 2, 0]);
console.log(val);