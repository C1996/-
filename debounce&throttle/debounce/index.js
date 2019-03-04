// 防抖是将多次执行变为最后一次执行

// 第一种防抖机制 事件触发 => 延时 => 执行回调   多用于输入框提示

// 回调函数 一般用于处理业务逻辑等
function callBack(value) {
  console.log('ahaha')
}

// 核心函数包装 闭包
// 1、设置定时器 2、返回闭包函数
function debounce(fn, delay = 500) {
  // 第一种做法 常见做法
  let timer = null // 设置定时器
  return function(args) {
    const that = this // 定时器内部 this 指向偏离 这里做个保存
    const _args = args // 保存参数 备用
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.call(that, _args)
    }, delay)
  }

  //第二种做法 将timer保存在fn函数上
  clearTimeout(fn.timer)
  fn.timer = setTimeout(() => {
    fn.call(that, _args)
  }, delay)
}

// 保存闭包函数 返回带有延时的函数
let debounceFn = debounce(callBack, 500)

// 监听事件
let input = document.getElementById('debounce')
input.addEventListener('keyup', e => {
  debounceFn(e.target.value)
})

// 第二种防抖机制  事件触发 => 执行回调函数 => 延时 多用于按钮防点击

function debounce(fn, delay = 500, immediate = true) {
  let timer = null
  return function(args) {
    const that = this
    const _args = args
    if (timer) clearTimeout(timer)
    if (immediate) {
      if (!timer) fn.call(that, _args)
      timer = setTimeout(() => {
        timer = null // 延时后 将本次延时置为空 防止内存泄漏
      }, delay)
    } else {
      timer = setTimeout(() => {
        fn.call(that, _args)
      }, delay)
    }
  }
}
