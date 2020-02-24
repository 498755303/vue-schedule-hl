<!--
 * @Description: 新增v2版本
 * @LastEditors: HL
 * @LastEditTime: 2020-02-24 20:16:32
 -->
<template>
  <div class="schedule"
       :id="comId">
    <div class="schedule-title">
      <slot name="title"></slot>
    </div>
    <div class="schedule-content">
      <div class="schedule-header">
        <div class="head-total">星期/时间</div>
        <div class="head-time">
          <div class="time-cate">
            <p>上午(00:00-12:00)</p>
            <p>下午(12:00-24:00)</p>
          </div>
          <ul class="time-part clearfix">
            <li v-for="(n,index) in 24"
                @click.stop="_timeClick(index)"
                :key="index">{{n-1}}</li>
          </ul>
        </div>
      </div>
      <div class="schedule-body">
        <ul class="week">
          <li v-for="(item,index) in weekArr"
              @click="_weekClickHandle(item,index)"
              :key="index">星期{{item}}</li>
        </ul>
        <div class="select-wrap"
             @mousedown="_mouseDownHandle">
          <div class="checked-list clearfix">
            <div :class="{
              'checked-item':true,
              'selected':item==1,
              'w24':timeArr.length / 7 == 24,
              'w48':timeArr.length / 7 == 48,
              'w96':timeArr.length / 7 == 96,
            }"
                 v-for="(item,index) in timeArr"
                 @click.stop="(e)=>_setCurrentItem(e,item,index)"
                 :key="index"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="schedule-info"
         v-if="showResult">
      <div class="row schedule-info-tip">
        <p>{{_isSelected()?'可拖动鼠标选择时间段':'已选择时间段'}}</p>
        <el-button type="danger"
                   @click.stop="_clear"
                   size="small">清空所有选择</el-button>
      </div>
      <ul class="info-ul">
        <template v-for="(item,index) in selected">
          <li class="info-li"
              :key="index"
              v-if="item.length">
            <span class="info-li-week">星期{{weekArr[index]}}:</span>
            <span class="info-li-time"
                  v-for="(v,i) in item"
                  :key="i">{{v[0]}}--{{v[1]}}</span>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>
<script>
import _ from "lodash";
import { on, off } from "./util/dom";
import { schedlueWeek2Time, time2Schedule, schedule2Time } from "./util/util";
export default {
  name: "VueSchedule",
  props: {
    // 时间间隔(0.5 1)
    timeSetp: {
      type: Number,
      default() {
        return 0.5;
      },
      validator: function (value) {
        if (value) {
          return [0.5, 1, 0.25].indexOf(value) !== -1;
        } else {
          return true;
        }
      }
    },
    // 时间字符串"0001010..."
    timeString: {
      type: String,
      default() {
        let _timeArray = [];
        for (let i = 0; i < (24 / this.timeSetp) * 7; i++) {
          _timeArray.push('0');
        }
        return _timeArray.join('');
      },
      validator: function (value) {
        if (value) {
          return (value.length / 24) % 1 == 0;
        } else {
          return true;
        }
      }
    },
    // 框选到外部时是否取消
    outCancel: {
      type: Boolean,
      default: true
    },
    // 是否显示结果
    showResult: {
      type: Boolean,
      default: true
    },
    // 组件ID
    comId: {
      type: String,
      required: true,
      default: "scheduleComponent"
    },
    // 星期是否可点击
    weekClickable: {
      type: Boolean,
      default: true
    },
    // 顶部时间是否可点击
    timeClickable: {
      type: Boolean,
      default: true
    }
  },
  model: {
    prop: 'timeString',
    event: 'triggerTime'
  },
  data() {
    return {
      weekArr: ['一', '二', '三', '四', '五', '六', '日'],
      timeArr: this.timeString.split(''),
      isSelect: true,
      selectBoxDashed: null,
      startX: null,
      startY: null,
      initx: null,
      scrollX: null,
      scrollY: null,
      width: null,
      height: null,
      top: 0,
      left: 0,
      inity: null,
      selected: [],
      firstTime: 0,
      lastTime: 0,
      isClick: false
    };
  },
  methods: {
    // 事件冒泡
    clearBubble(e) {
      if (e.stopPropagation) {
        e.stopPropagation();
      } else {
        e.cancelBubble = true;
      }
      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
    },
    // 设置当前格状态
    _setCurrentItem(e, val, index) {
      if (this.isClick) {
        this.clearBubble(e);
        if (val == 0) {
          this.timeArr.splice(index, 1, '1');
        } else {
          this.timeArr.splice(index, 1, '0');
        }
        this.$emit('triggerTime', this.timeArr.join(''));
      }
    },
    // 鼠标按下事件
    _mouseDownHandle(e) {
      this.firstTime = new Date().getTime();
      //  创建选框节点
      this.selectBoxDashed = document.createElement('div');
      this.selectBoxDashed.className = 'select-box-dashed';
      document.body.appendChild(this.selectBoxDashed);
      this.scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
      this.scrollY = document.documentElement.scrollTop || document.body.scrollTop;
      //  设置选框的初始位置
      this.startX = e.x + this.scrollX || e.clientX + this.scrollX;
      this.startY = e.y + this.scrollY || e.clientY + this.scrollY;
      this.selectBoxDashed.style.cssText = `left:${this.startX}px;top:${this.startY}px`;
      //  清除事件冒泡、捕获
      this.clearBubble(e);
      on(document.getElementById(this.comId), 'mousemove', this._theottleMove);
      on(document.body, 'mouseup', this._mouseUpHandle);
    },
    _theottleMove: _.throttle(function (e) {
      this._mouseMoveHandle(e);
    }, 16),
    // 鼠标移动事件
    _mouseMoveHandle(e) {
      //  设置选框可见
      this.selectBoxDashed.style.display = 'block';
      // 根据鼠标移动，设置选框的位置、宽高
      this.initx = e.x + this.scrollX || e.clientX + this.scrollX;
      this.inity = e.y + this.scrollY || e.clientY + this.scrollY;
      //  暂存选框的位置及宽高，用于将 select-item 选中
      this.left = Math.min(this.initx, this.startX);
      this.top = Math.min(this.inity, this.startY);
      this.width = Math.abs(this.initx - this.startX);
      this.height = Math.abs(this.inity - this.startY);
      this.selectBoxDashed.style.left = `${this.left}px`;
      this.selectBoxDashed.style.top = `${this.top}px`;
      this.selectBoxDashed.style.width = `${this.width}px`;
      this.selectBoxDashed.style.height = `${this.height}px`;
      this.clearBubble(e);
    },
    // 鼠标抬起
    _mouseUpHandle(e) {
      off(document.getElementById(this.comId), 'mousemove', this._theottleMove);
      off(document.body, 'mouseup', this._mouseUpHandle);
      this.lastTime = new Date().getTime();
      if ((this.lastTime - this.firstTime) < 200) {
        this.isClick = true;
      } else {
        let flag = this._noContainComponents(e);
        if ((this.outCancel && !flag) || !this.outCancel) {
          this._containItemChange();
        }
        if (this.selectBoxDashed) {
          try {
            this.selectBoxDashed.parentNode.removeChild(this.selectBoxDashed);
          } catch (err) {
            // console.log(err)
          }
        }
        this.$emit('triggerTime', this.timeArr.join(''));
        this.clearBubble(e);
      }
    },
    // 判断dom是否在选择区内
    _containItem() {
      let checkedItems = document.querySelectorAll(`#${this.comId} .checked-item`);
      for (let i = 0; i < checkedItems.length; i++) {
        let itemX_pos = checkedItems[i].offsetWidth + checkedItems[i].offsetLeft;
        let itemY_pos = checkedItems[i].offsetHeight + checkedItems[i].offsetTop;
        let condition1 = itemX_pos > this.left;
        let condition2 = itemY_pos > this.top;
        let condition3 = checkedItems[i].offsetLeft < (this.left + this.width);
        let condition4 = checkedItems[i].offsetTop < (this.top + this.height);
        if (condition1 && condition2 && condition3 && condition4) {
          checkedItems[i].classList.add('temp-selected');
        } else {
          checkedItems[i].classList.remove('temp-selected');
        }
      }
    },
    // 判断dom是否在选择区内,处理样式
    _containItemChange() {
      let checkedItems = document.querySelectorAll(`#${this.comId} .checked-item`);
      for (let i = 0; i < checkedItems.length; i++) {
        let itemX_pos = checkedItems[i].offsetWidth + checkedItems[i].offsetLeft;
        let itemY_pos = checkedItems[i].offsetHeight + checkedItems[i].offsetTop;
        let condition1 = itemX_pos > this.left;
        let condition2 = itemY_pos > this.top;
        let condition3 = checkedItems[i].offsetLeft < (this.left + this.width);
        let condition4 = checkedItems[i].offsetTop < (this.top + this.height);
        if (condition1 && condition2 && condition3 && condition4) {
          if (this.timeArr[i] == 1) {
            this.timeArr.splice(i, 1, "0");
          } else {
            this.timeArr.splice(i, 1, "1");
          }
        }
      }
    },
    // 判断结束点是否在组件外部
    _noContainComponents(e) {
      let el = document.getElementById(this.comId);
      let endX = e.clientX + this.scrollX || e.x + this.scrollX;
      let endY = e.clientY + this.scrollY || e.y + this.scrollY;
      let condition1 = endX < el.offsetLeft;
      let condition2 = endX > el.offsetLeft + el.offsetWidth;
      let condition3 = endY < el.offsetTop;
      let condition4 = endY > el.offsetTop + el.offsetHeight;
      return condition1 || condition2 || condition3 || condition4;
    },
    // 星期点击
    _weekClickHandle(item, index) {
      if (!this.weekClickable) return;
      const len = this.timeArr.length / 7;
      let arr = this.timeArr.slice(index * len, (index + 1) * len);
      let flag = arr.some(item => {
        return item == 0;
      });
      for (let i = index * len; i < (index + 1) * len; i++) {
        if (flag) {
          this.timeArr.splice(i, 1, "1");
        } else {
          this.timeArr.splice(i, 1, "0");
        }
      }
    },
    // 顶部时间点击
    _timeClick(index) {
      if (!this.timeClickable) return;
      const cellNum = 24 / this.timeSetp;
      const miniCellCount = 1 / this.timeSetp;
      let cellList = [];
      let timeList = [];
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < miniCellCount; j++) {
          cellList.push(cellNum * i + index * miniCellCount + j);
          timeList.push(this.timeArr[cellNum * i + index * miniCellCount + j]);
        }
      }
      let flag = timeList.some(item => {
        return item == 0;
      });
      for (let i = 0; i < cellList.length; i++) {
        if (flag) {
          this.timeArr.splice(cellList[i], 1, "1");
        } else {
          this.timeArr.splice(cellList[i], 1, "0");
        }
      }
    },
    // 清空
    _clear() {
      let tmp = new Array(24 / this.timeSetp * 7).fill(0);
      this.timeArr = tmp;
    },
    // 是否有选中的
    _isSelected() {
      return this.timeArr.join("") == new Array(24 / this.timeSetp * 7).fill(0).join("");
    },
    commonFn() {
      return {
        time2Schedule,
        schedule2Time
      };
    }
  },
  watch: {
    timeArr: {
      handler(nv) {
        this.selected = schedlueWeek2Time(nv.join(""), "array");
        this.$emit("result-change", nv);
      },
      deep: true
    }
  }
};
</script>
<style scoped lang="less">
@baseClass: schedule;
@baseLineH: 2em;
@columnsW: 100px;
@columnsH: 30px;
@borderC: #ddd;
.@{baseClass} {
  display: block;
  width: 100%;
  line-height: @baseLineH;
  .@{baseClass}-title {
    display: block;
    text-align: center;
  }
  .@{baseClass}-content {
    border: 1px solid @borderC;
    .@{baseClass}-header {
      display: flex;
      justify-content: flex-start;
      border-bottom: 1px solid @borderC;
      align-items: center;
      text-align: center;
      .head-total {
        display: block;
        width: @columnsW;
      }
      .head-time {
        display: block;
        width: calc(100% - @columnsW);
        border-left: 1px solid @borderC;
        .time-cate {
          display: flex;
          justify-content: flex-start;
          border-bottom: 1px solid @borderC;
          p {
            width: 50%;
            line-height: 1.2em;
            &:first-child {
              border-right: 1px solid @borderC;
            }
          }
        }
        .time-part {
          display: block;
          width: 100%;
          li {
            float: left;
            width: calc(100% / 24);
            border-right: 1px solid @borderC;
            cursor: pointer;
            &:last-child {
              border: none;
            }
          }
        }
      }
    }
    .@{baseClass}-body {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      text-align: center;
      .week {
        display: block;
        width: @columnsW;
        li {
          height: @columnsH;
          line-height: @columnsH;
          border-bottom: 1px solid @borderC;
          cursor: pointer;
          &:last-child {
            border: none;
          }
        }
      }
      .select-wrap {
        display: block;
        width: calc(100% - @columnsW);
        border-left: 1px solid @borderC;
        .checked-list {
          display: block;
          width: 100%;
          .checked-item {
            float: left;
            height: @columnsH;
            line-height: @columnsH;
            border-right: 1px solid @borderC;
            border-bottom: 1px solid @borderC;
            cursor: pointer;
            background-color: #fff;
            &.w24 {
              width: calc(100% / 24);
              &:nth-child(24n) {
                border-right: none;
              }
              &:nth-child(n + 145) {
                border-bottom: none;
              }
            }
            &.w48 {
              width: calc(100% / 48);
              &:nth-child(48n) {
                border-right: none;
              }
              &:nth-child(n + 289) {
                border-bottom: none;
              }
            }
            &.w96 {
              width: calc(100% / 96);
              &:nth-child(96n) {
                border-right: none;
              }
              &:nth-child(n + 577) {
                border-bottom: none;
              }
            }
            &.selected {
              background-color: #409eff;
            }
          }
        }
      }
    }
  }
  .@{baseClass}-info {
    padding: 10px 20px;
    .schedule-info-tip {
      justify-content: space-between !important;
    }
    .info-ul {
      .info-li {
        padding: 2px 0;
        font: 13px/2em "microsoft-yahei";
        .info-li-week {
          width: 80px;
          margin-right: 10px;
        }
        .info-li-time {
          color: #818181;
          margin-right: 15px;
        }
      }
    }
  }
}
</style>
<style>
.select-box-dashed {
  position: absolute;
  display: none;
  width: 0px;
  height: 0px;
  padding: 0px;
  margin: 0px;
  border: 1px dashed #0099ff;
  background-color: #c3d5ed;
  opacity: 0.5;
  filter: alpha(opacity=50);
  font-size: 0px;
  z-index: 99999;
  transition: all 0.1 linear;
}
</style>
