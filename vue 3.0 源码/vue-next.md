# Vue 3.0 reactive 源码笔记

## 依赖 track 和 trigger 

### trigger 方法

注意要点:
```ts
const arr = reactive([0, 1, 2])
arr[3] = 3 
```
proxy 的 set 方法里会判断出 `arr` 没有 '3' 这个 index(key), trigger 的 type 为 'SET'
```ts
// effect.ts trigger 方法内部
// 判断操作是 ADD 或者 DELETE, 这时候数组 length 属性会变, 如上例 arr.length 更新为 4
// 这里执行依赖 arr.length 的 effect 
if (type === OperationTypes.ADD || type === OperationTypes.DELETE) {
    const iterationKey = Array.isArray(target) ? 'length' : ITERATE_KEY
    addRunners(effects, computedRunners, depsMap.get(iterationKey))
}
```

### computed 
computed 是通过 dirty 闭包变量来决定要不要执行 effect
当其依赖更新时, trigger 方法会将 effect 添加到 computedRunners, scheduleRun 会调用 effect.scheduler
从而设置 dirty 为 true, 在下次 get 时就会重新执行 effect 计算出新值


### activeReactiveEffectStack
activeReactiveEffectStack 是个栈. 在执行 effect 的 fn 之前, 会将 effect push 进 activeReactiveEffectStack

```ts
// effect.ts run 方法内部
try {
  activeReactiveEffectStack.push(effect)
  return fn(...args)
} finally {
  activeReactiveEffectStack.pop()
}
```
此时, 如果 fn 执行的时候有依赖收集, 即调用 track, 就会把这个 effect 取出来, 然后设置好依赖关系
#### track
```ts
// effect.ts track 方法内部
const effect = activeReactiveEffectStack[activeReactiveEffectStack.length - 1]
if (effect) {
  if (type === OperationTypes.ITERATE) {
    key = ITERATE_KEY
  }
  let depsMap = targetMap.get(target)
  if (depsMap === void 0) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key!)
  if (dep === void 0) {
    depsMap.set(key!, (dep = new Set()))
  }
  if (!dep.has(effect)) {
    dep.add(effect)
    effect.deps.push(dep)
    if (__DEV__ && effect.onTrack) {
      effect.onTrack({
        effect,
        target,
        type,
        key
      })
    }
  }
}
```
最后执行完 effect, 就会一个个 pop 出来

### targetMap 结构 (伪代码)
`targetMap` 是用来以 源对象 `target` 为 key, 以其每个 key 所劫持的 `Dep` 组成的 `KeyToDepMap` 为 value 的 `WeakMap`
`Dep` 是一个 `Set`, 因此一个 key 可以劫持多个依赖

以上 track 源码流程伪代码如下: 
```ts
const target = { a : 1 }
const effect = activeReactiveEffectStack[activeReactiveEffectStack.length - 1]
const dep = new Set([effect])
const keyToDepMap = new Map({ a: dep })
effect.deps.push(dep)
targetMap = { [target]: KeyToDepMap }
```
