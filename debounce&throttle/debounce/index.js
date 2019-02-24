// 第一种防抖机制 事件触发 => 延时 => 执行回调   模拟输入框提示机制

// 回调函数 一般用于处理业务逻辑等
function callBack() {
  console.log('ahaha')
}

// 核心函数包装 闭包
// 1、设置定时器 2、返回闭包函数
function debounce(fn, delay = 500) {

  // 第一种做法 常见做法
  const timer = null // 设置定时器
  return function (args) {
    const that = this // 定时器内部 this 指向偏离 这里做个保存
    const _args = args // 保存参数 备用
    if (timer) clearTimeout(timer)
    timer = setTimeout(function () {
      fn.call(that, _args)
    }, delay)
  }


  //第二种做法 将timer保存在fn函数上
  clearTimeout(fn.timer)
  fn.timer = setTimeout(function () {
    fn.call(that, _args)
  }, delay)
}

// 保存闭包函数 返回带有延时的函数
let debounceFn = debounce(callBack, 500)

// 监听事件
let input = document.getElementById('debounce')
input .addEventListener('keyup', function (e) {
  debounceFn(e.target.value)
})