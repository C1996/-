
const rawToReactive = new WeakMap();
const reactiveToRaw = new WeakMap();

const targetMap = new WeakMap();

const activeReactiveEffectStack = [];

const effectSymbol = Symbol('effect')
const isEffect = (fn) => {
  return fn != null && fn[effectSymbol] === true
}


const proxyHandle = {
  get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)
    track(target, key, 'get')
    return res;
  },

  set(target, key, receiver) {
    const res = Reflect.set(target, key, receiver);
    trigger(target, key, 'set')
    return res;
  }
}

function reactive(target) {
  if (rawToReactive.get(target)) {
    return rawToReactive.get(target)
  }

  const reactiveObject = new Proxy(target, proxyHandle);
  rawToReactive.set(target, reactiveObject);
  reactiveToRaw.set(reactiveObject, target);
  return reactiveObject
}

function effect(fn, options = {}) {
  if (isEffect(fn)) {
    fn = fn.raw;
  }
  const effect = (...args) => {
    return runEffect(effect, fn, args);
  }

  effect.raw = fn;
  effect[effectSymbol] = true;
  effect.scheduler = options.scheduler;
  effect.computed = options.computed;
  effect.deps = [];

  if (!options.lazy) {
    effect()
  }

  return effect;
}

function runEffect(effect, fn, args) {
  if (activeReactiveEffectStack.indexOf(effect) === -1) {
    cleanup(effect)
    try {
      activeReactiveEffectStack.push(effect);
      return fn(...args)
    } finally {
      activeReactiveEffectStack.pop();
    }
  }
}

function cleanup(effect) {
  const { deps } = effect;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      // targetMap里删除这个 effect
      deps[i].delete(effect)
    }
    // 清空 deps
    deps.length = 0
  }
}

function computed(fn) {
  let dirty = true
  let value;
  const runner = effect(fn, {
    lazy: true,
    computed: true,
    scheduler() {
      dirty = true;
    }
  })
  return {
    effect: runner,
    get value() {
      if (dirty) {
        value = runner();
        dirty = false
      }
      trackChildRun(runner)
      return value
    }
  }
}

function trackChildRun(childRunner) {
  const parentRunner = activeReactiveEffectStack[activeReactiveEffectStack.length - 1]
  if (parentRunner) {
    for (let i = 0; i < childRunner.deps.length; i++) {
      const dep = childRunner.deps[i]
      if (!dep.has(parentRunner)) {
        dep.add(parentRunner)
        parentRunner.deps.push(dep)
      }
    }
  }
}

function track(target, key) {
  const effect = activeReactiveEffectStack[activeReactiveEffectStack.length - 1];
  let depMap = targetMap.get(target)
  if (!depMap) {
    targetMap.set(target, depMap = new Map())
  }
  let dep = depMap.get(key)
  if (!dep) {
    depMap.set(key, dep = new Set())
  }
  // 收集依赖
  if (!dep.has(effect)) {
    dep.add(effect)
    effect.deps.push(dep)
  }
}

function trigger(target, key) {
  const depMap = targetMap.get(target)
  if (depMap == void 0) {
    return;
  }
  const effects = new Set();
  const computedRunners = new Set();
  const deps = depMap.get(key)
  
  deps.forEach(effect => {
    if (effect.computed) {
      computedRunners.add(effect)
    } else {
      effects.add(effect)
    }
  })

  const run = (effect) => {
    if (effect.scheduler) {
      effect.scheduler(effect)
    } else {
      effect()
    }
  }

  computedRunners.forEach(run)
  effects.forEach(run)
}


function main() {
  const a = reactive({name: 'xiaoming', age: 18})
  const b = computed(() => a.age * 2)
  effect(() => {
    console.log('b:', b.value)
  })
  const handle = effect(() => {
    console.log('name', a.name)
  }, {lazy: true})
  handle()
  
  a.age = 20;
  a.name = 'xiaohong';
}

main()





