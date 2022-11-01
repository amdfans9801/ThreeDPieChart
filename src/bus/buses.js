import Mitt from "mitt";

const VM = new Mitt();
VM.$on = VM.on;
VM.$off = VM.off;
VM.$emit = VM.emit;

const SignalType = {
    Scene_Camera_MoveStart: "Scene_Camera_MoveStart", //场景相机开始移动时事件
	Scene_Camera_Changed: "Scene_Camera_Changed", //场景相机参数改变事件
	Scene_Camera_MoveEnd: "Scene_Camera_MoveEnd", //场景相机移动结束事件
	Scene_Mouse_Left_Click: "Scene_Mouse_Left_Click", //场景鼠标左键单击事件
	Scene_Mouse_Right_Click: "Scene_Mouse_Right_Click", //场景鼠标右键单击事件
	Scene_Mouse_DoubleLeft_Click: "Scene_Mouse_DoubleLeft_Click", //场景鼠标左键双击事件
	Scene_Mouse_Move: "Scene_Mouse_Move", //场景鼠标漫游事件
	Scene_Left_Down: "Scene_Left_Down", //场景鼠标左键按下事件
	Scene_Left_Up: "Scene_Left_Up", //场景鼠标左键抬起事件
	Scene_Mouse_Wheel: "Scene_Mouse_Wheel", //场景鼠标滚轮滑动事件
	Scene_Init_Finish: "Scene_Init_Finish", //场景初始化完成事件
	Scene_Mouse_Middle_Move: "Scene_Mouse_Middle_Move", //场景鼠标滚轮按下滑动事件

    
};

export default {
    SignalType, VM
}