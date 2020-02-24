/** 一周的时间转换
 * @param {*} scheduleTime 时间字符串(支持24,48,96),如 100010101(7 * 48 位)
 * @param {String} resType 返回值类型 enum : array,object
 * @returns {"星期一":[["07:00","08:30"]],"星期二":[]}类型数据
 */
const schedlueWeek2Time = (scheduleTime, resType) => {
  const scheduleLen = scheduleTime.length;
  const size = scheduleLen / 7;
  if (scheduleLen % 7 != 0 || scheduleLen % 24 != 0) {
    new Error("传入的字符串不正确");
    return;
  }
  let scheduleList = [];
  let res = {};
  let resArr = [];
  for (var i = 0; i < scheduleLen; i++) {
    if (i % size === 0) {
      scheduleList.push(scheduleTime.substr(i, size));
    }
  }
  scheduleList.forEach((v, i) => {
    const tmp = schedule2Time(v);
    res[num2Week(i)] = tmp;
    resArr.push(tmp);
  });
  return resType == "array" ? resArr : res;
};
/** 时间字符串转时间段
 * @param {*} scheduleTime 时间字符串,如 100010101(48位,1天的)
 * @return ["07:00","08:30"]的二维数组
 */
const schedule2Time = scheduleTime => {
  if (!scheduleTime) return "不限";
  const scheduleTimeLen = scheduleTime.length;
  if (scheduleTimeLen % 24 != 0) throw new Error("参数错误");
  if (scheduleTime.indexOf("0") === -1 || scheduleTime.indexOf("1") === -1) {
    return [];
  }
  let startFlag = false;
  let start;
  let end;
  let res = [];
  for (var i = 0; i < scheduleTime.length; i++) {
    switch (scheduleTime.charAt(i)) {
      case "1":
        if (!startFlag) {
          start = i;
          startFlag = true;
        }
        break;
      case "0":
        if (startFlag) {
          end = i - 1;
          startFlag = false;
          res.push(index2Time(start, end, scheduleTimeLen));
          start = end = false;
        }
        break;
      default:
        break;
    }
    if (i % scheduleTimeLen === scheduleTimeLen - 1) {
      if (start && !end) {
        res.push(index2Time(start, i, scheduleTimeLen));
        start = end = false;
        startFlag = 0;
      }
      return res;
    }
  }
};
function index2Time(start, end, len) {
  const type = len / 24;
  const size = 60 / type;
  let startTime;
  let endTime;
  let tmp = {
    start1: (start % len) % type,
    start2: (start % len) / type,
    start3: Math.floor((start % len) / type),
    end1: (end % len) % type,
    end2: (end % len) / type,
    end3: Math.floor((end % len) / type)
  };
  if (tmp.start1 === 0) {
    startTime = (tmp.start2 < 10 ? "0" + tmp.start2 : tmp.start2) + ":00";
  } else {
    startTime =
      (tmp.start3 < 10 ? "0" + tmp.start3 : tmp.start3) +
      `:${tmp.start1 * size}`;
  }
  // if (tmp.end1 === 0) {
  //   endTime = (tmp.end2 < 10 ? "0" + tmp.end2 : tmp.end2) + ":30";
  // } else {
  //   endTime = (tmp.end3 < 10 ? "0" + tmp.end3 : tmp.end3) + ":00";
  // }
  if (size * (tmp.end1 + 1) == 60) {
    endTime = (tmp.end3 < 9 ? "0" + (tmp.end3 + 1) : tmp.end3 + 1) + ":00";
  } else {
    endTime =
      (tmp.end3 < 10 ? "0" + tmp.end3 : tmp.end3) + `:${size * (tmp.end1 + 1)}`;
  }
  return [startTime, endTime];
}
// 数字0-6转星期
function num2Week(num) {
  let res;
  switch (num) {
    case 0:
      res = "星期一";
      break;
    case 1:
      res = "星期二";
      break;
    case 2:
      res = "星期三";
      break;
    case 3:
      res = "星期四";
      break;
    case 4:
      res = "星期五";
      break;
    case 5:
      res = "星期六";
      break;
    case 6:
      res = "星期日";
      break;
    default:
      break;
  }
  return res;
}
/** 时间段数组转时间段字符串
 * @param {*} dateList 时间段数组
 * ["05:00", "07:30"],["08:00", "24:00"]  转  "000000000011111011111111111111111111111111111111"
 */
const time2Schedule = (dateList, size) => {
  let sizeTmp = size || 48;
  let allStr = new Array(sizeTmp).fill(0).join("");
  if (!dateList) return allStr;
  if (dateList === "不限") return allStr;
  if (dateList && dateList instanceof Array) {
    let start;
    let end;
    let res = allStr;
    dateList.forEach(value  => {
      if (value && value instanceof Array && value.length === 2) {
        start = time2Position(value[0], sizeTmp);
        end = time2Position(value[1], sizeTmp);
        res = replaceStrByposition(
          res,
          start,
          end,
          new Array(end - start).fill(1).join("")
        );
      }
    });
    return res;
  } else {
    throw new Error("输入参数错误");
  }
};
// 时间hh:mm转位置
function time2Position(timeStr, size) {
  let tmp = timeStr.split(":");
  const sizeTmp = size / 24;
  let p;
  switch (tmp[1]) {
    case "00":
      p = tmp[0] * sizeTmp;
      break;
    case "15":
      p = tmp[0] * sizeTmp + 1;
      break;
    case "30":
      p = tmp[0] * sizeTmp + 2;
      break;
    case "45":
      p = tmp[0] * sizeTmp + 3;
      break;
    default:
      break;
  }
  return p;
}
/** 替换指定位置内的字符串
 * @param {*} oStr 原始字符串
 * @param {*} start 起始位置
 * @param {*} end 结束位置
 * @param {*} replaceStr 替换成的字符串
 */
function replaceStrByposition(oStr, start, end, replaceStr) {
  return oStr.substring(0, start) + replaceStr + oStr.substring(end);
}
export { schedule2Time, schedlueWeek2Time, time2Schedule };
