// 节流是将多次执行行为在规定时间内只执行一次

// 定义时间戳 对当前的时间戳和上次时间戳进行对比

function throttle(fn, delay = 500) {
  let previous = 0
  return function(args) {
    let that = this
    let _args = args
    let now = Date.now()
    if (now - previous > delay) {
      fn.call(that, _args)
      previous = now
    }
  }
}

// 定义定时器

function throttle(fn, delay = 500) {
  let timer
  return function() {
    let that = this
    if (!timer) {
      timer = setTimeout(() => {
        timer = null
        fn.apply(that, arguments)
      }, delay)
    }
  }
}

// 定时器和时间戳混合

function throttle(fn, delay = 500) {
  let timer
  let previous = 0
  return function() {
    let that = this
    let now = Date.now()
    let remaining = delay - (now - previous)
    if (timer) clearTimeout(timer)
    if (remaining <= 0) {
      fn.call(that, arguments)
      previous = now
    } else {
      timer = setTimeout(() => {
        fn.call(that, arguments)
      }, remaining)
    }
  }
}
