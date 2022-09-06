/**
 * 计算页面的FPS
 * requestAnimationFrame作为原理
 * 不掉帧的情况下，requestAnimationFrame 这个方法在一秒内会执行 60 次
 * 假设动画在时间 A 开始执行，在时间 B 结束，耗时 x ms。而中间 requestAnimationFrame 一共执行了 n 次
 * 则此段动画的帧率大致为：n / (B - A)
 * 
 * 参照网络提供的代码借用修改   v1.0.0
 * date: 2022.09.06 22:15 ywq
 * (我真的不想搞，不想做任何事情....情绪也好不起来，但这可能是药物能够达到的最好状态了，已经足够稳定了。
 * 说实话，仔细比较之下能到达这种情况我应该对药物已经很满足了，不可能再奢求太多也不可能什么都靠药物，得要自己努力。
 * 但我真的真的没有力气做事情....淦，今天先到这吧，实在搞不下去23：27PM)
 */

/**
 * 实际实验了下，window.requestAnimationFrame(callback),每执行一次就会返回一个计数，这个计数是从1开始，
 * 每执行一次，这个返回值就会加1;
 * 查找资料得知：
 *     1、requestAnimationFrame 会把每一帧中的所有DOM操作集中起来，在一次重绘或回流中就完成，并且重绘或回流的时间间隔紧紧跟随浏览器的刷新频率，一般来说，这个频率为每秒60帧。
 *     2、在隐藏或不可见的元素中，requestAnimationFrame将不会进行重绘或回流，这当然就意味着更少的的cpu，gpu和内存使用量。
 * 
 * 个人理解：window.requestAnimationFrame(callback)这个方法写出来，就是告诉浏览器下次重绘的DOM之前，
 *          执行callback，callback执行次数通常是每秒60次；
 *          （因为显示器屏幕刷新频率60Hz，所以就意味着gpu是在一直重绘页面的，就是1000ms/60次，
 *            所以页面实际上也是重绘的（只重绘显示区域）
 */

let frameInvokedCounts = 0;

function calculateFPS(){

}
