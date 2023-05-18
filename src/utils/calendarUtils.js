/** 标签的通用方法*/
import moment from 'moment';

export const calendarColors = ['#9e5fff','#00a9ff','#ff5583','#03bd9e','#bbdc00','#ffbb3b','#191970','#800080','#EE82EE','#B22222'];

/**
 * 日历视图类型
 */
export const viewModeOptions = [
  {
    title: '月视图',
    value: 'month'
  },
  {
    title: '周视图',
    value: 'week'
  },
  {
    title: '日视图',
    value: 'day'
  }
];

export const timezones = [
  {
    timezoneOffset: 540,
    displayLabel: 'GMT+09:00',
    tooltip: 'Seoul'
  },
  {
    timezoneOffset: -420,
    displayLabel: 'GMT-08:00',
    tooltip: 'Los Angeles'
  }
];

export const template =
{
  milestone: function(schedule) {
      return getGridCategoryTemplate('milestone', schedule);
  },
  milestoneTitle: function() {
      return getGridTitleTemplate('milestone');
  },
  task: function(schedule) {
      return getGridCategoryTemplate('task', schedule);
  },
  taskTitle: function() {
      return getGridTitleTemplate('task');
  },
  allday: function(schedule) {
      return getTimeTemplate(schedule, true);
  },
  alldayTitle: function() {
      return getGridTitleTemplate('allday');
  },
  time: function(schedule) {
      return getTimeTemplate(schedule, false);
  },
  goingDuration: function(schedule) {
      return '<span class="calendar-icon ic-travel-time"></span>' + schedule.goingDuration + 'min.';
  },
  comingDuration: function(schedule) {
      return '<span class="calendar-icon ic-travel-time"></span>' + schedule.comingDuration + 'min.';
  },
  monthMoreTitleDate: function(date, dayname) {
      var day = date.split('.')[2];
      return '<span class="tui-full-calendar-month-more-title-day">' + day + '</span> <span class="tui-full-calendar-month-more-title-day-label">' + dayname + '</span>';
  },
  monthMoreClose: function() {
      return '<span class="tui-full-calendar-icon tui-full-calendar-ic-close"></span>';
  },
  monthGridHeader: function(dayModel) {
      var date = parseInt(dayModel.date.split('-')[2], 10);
      var classNames = ['tui-full-calendar-weekday-grid-date '];

      if (dayModel.isToday) {
          classNames.push('tui-full-calendar-weekday-grid-date-decorator');
      }

      return '<span class="' + classNames.join(' ') + '">' + date + '</span>';
  },
  monthGridHeaderExceed: function(hiddenSchedules) {
      return '<span class="weekday-grid-more-schedules">+' + hiddenSchedules + '</span>';
  },
  monthGridFooter: function() {
      return '';
  },
  monthGridFooterExceed: function(hiddenSchedules) {
      return '';
  },
  monthDayname: function(model) {
      return String(model.label).toLocaleUpperCase();
  },
  dayGridTitle: function(viewName) {
    /*
     * use another functions instead of 'dayGridTitle'
     * milestoneTitle: function() {...}
     * taskTitle: function() {...}
     * alldayTitle: function() {...}
    */

    return getGridTitleTemplate(viewName);
  },
  schedule: function(schedule) {
    /*
     * use another functions instead of 'schedule'
     * milestone: function() {...}
     * task: function() {...}
     * allday: function() {...}
    */
    return getGridCategoryTemplate(schedule.category, schedule);
  }
}

export function getTimeTemplate(schedule, isAllDay) {
  var html = [];
  if (!isAllDay) {
    let hm = moment(schedule.start.getTime()).format('HH:mm');
    html.push('<strong>' + hm + '</strong> ');
  }
  if (schedule.isPrivate) {
    html.push('<span class="calendar-font-icon ic-lock-b"></span>');
    html.push(' Private');
  } else {
    if (schedule.isReadOnly) {
      html.push('<span class="calendar-font-icon ic-readonly-b"></span>');
    } else if (schedule.recurrenceRule) {
      html.push('<span class="calendar-font-icon ic-repeat-b"></span>');
    } else if (schedule.attendees.length) {
      html.push('<span class="calendar-font-icon ic-user-b"></span>');
    } else if (schedule.location) {
      html.push('<span class="calendar-font-icon ic-location-b"></span>');
    }
    html.push(' ' + schedule.title);
  }
  return html.join('');
}

export function getGridTitleTemplate(type) {
  var title = '';
  switch(type) {
    case 'milestone':
        title = '<span class="tui-full-calendar-left-content">MILESTONE</span>';
        break;
    case 'task':
        title = '<span class="tui-full-calendar-left-content">TASK</span>';
        break;
    case 'allday':
        title = '<span class="tui-full-calendar-left-content">ALL DAY</span>';
        break;
  }
  return title;
}

export function getGridCategoryTemplate(category, schedule) {
  var tpl;
  switch(category) {
    case 'milestone':
        tpl = '<span class="calendar-font-icon ic-milestone-b"></span> <span style="background-color: ' + schedule.bgColor + '">' + schedule.title + '</span>';
        break;
    case 'task':
        tpl = '#' + schedule.title;
        break;
    case 'allday':
        tpl = getTimeTemplate(schedule, true);
        break;
  }
  return tpl;
}


/**
 * 组装日历类别
 *
 * @param {Object} data
 */
export function generateCalendarList(data){
  let calendarList = new Array();
  let n = data.length;
  for(let i=0;i<n;i++){
    let calendar = {};
    calendar.id = data[i].id;
    calendar.name = data[i].text;
    calendar.color = '#ffffff';
    calendar.bgColor = calendarColors[i];
    calendar.dragBgColor = calendarColors[i];
    calendar.borderColor = calendarColors[i];
    calendarList.push(calendar);
  }
  return calendarList;
}

/**
 * 组装用户的日历
 *
 * @param {Object} data
 */
export function generateCalendarScheduleList(data,calendarList){
  let scheduleList = new Array();
  let n = data.length;
  for(let i=0;i<n;i++){
    let sd = generateCalendarSchedule(data[i],calendarList);
    scheduleList.push(sd);
  }
  return {total:n,list:scheduleList};
}

/**
 * 用户日历
 * @param {Object} uc
 * @param {Object} calendarList
 */
export function generateCalendarSchedule(uc,calendarList) {
    let schedule = new ScheduleInfo();
    let calendar = calendarList[uc.sourceTypeIndex];
    schedule.id = uc.id;
    schedule.calendarId = calendar.id;
    if(uc.finishTypeName==null){
        schedule.title = uc.title;
        schedule.body = uc.content;
    }else{
        if(uc.match){
            schedule.title = '★'+uc.title;
        }else{
            schedule.title = '☆'+uc.title;
        }
        var cc = '*日历内容:'+uc.content+'<br>';
        cc+='*完成类型:'+uc.finishTypeName;
        if(uc.finishedTime!=null){
            cc+=','+uc.finishedTime;
        }
        if(false==uc.match){
            cc+='(未匹配)';
        }else{
          cc+='(匹配)';
        }
        cc+='<br>';
        if(uc.value!=null){
            cc+='*完成详情:'+uc.value;
        }
        if(uc.unit!=null){
            cc+=uc.unit;
        }
        schedule.body = cc;
    }
    schedule.isReadOnly = uc.readOnly;
    //generateUserCalendarTime(uc,schedule);
    generateUserCalendarTime(uc,schedule);
    schedule.isPrivate = false;
    if(null!=uc.location){
        schedule.location=uc.location;
    }
    //参与者，目前为超链接
    schedule.attendees = [];
    if(uc.messageId!=null){
        schedule.attendees.push('<a href="#" onclick="showOriginMessage('+uc.messageId+')">【源消息内容】</a>');
    }
    if(uc.sourceId!=null){
        schedule.attendees.push('<a href="#" onclick="showCalendarSource(\''+uc.id+'\')">【来源信息】</a>');
    }
    if(uc.sourceType=='MANUAL'){
      let ss = uc.id.split('--');
      let id = parseInt(ss[1]);
      let editContent = '<a href="#" onclick="handleUpdate('+id+')">【编辑】</a>';
      schedule.attendees.push(editContent);
    }
    if('ONCE'==uc.period){
        schedule.recurrenceRule = uc.delayCounts>0 ? '延迟次数:'+uc.delayCounts : '';
    }else{
        schedule.recurrenceRule = uc.periodName;
        if(uc.periodValues){
            if('WEEKLY'==uc.period){
                schedule.recurrenceRule += '（周:'+uc.periodValues.replace('7','日')+'）';
            }else if('MONTHLY'==uc.period){
                schedule.recurrenceRule += '（'+uc.periodValues+'号）';
            }else{
                schedule.recurrenceRule += '（'+uc.periodValues+'）';
            }
        }
    }
    schedule.state = 'Free';
    schedule.color = calendar.color;
    schedule.bgColor = calendar.bgColor;
    schedule.dragBgColor = calendar.dragBgColor;
    schedule.borderColor = calendar.borderColor;

    if (schedule.category === 'milestone') {
        schedule.color = schedule.bgColor;
        schedule.bgColor = 'transparent';
        schedule.dragBgColor = 'transparent';
        schedule.borderColor = 'transparent';
    }
    schedule.raw.memo = uc.remark;
    return schedule;
}

/**
 * 组装行为数据日历
 *
 * @param {Object} data
 */
export function generateBehaviorScheduleList(data,calendarList){
  let scheduleList = new Array();
  let n = data.length;
  for(let i=0;i<n;i++){
    let sd = generateUserSchedule(data[i],calendarList);
    scheduleList.push(sd);
  }
  return {total:n,list:scheduleList};
}

/**
 * 组装操作数据日历
 *
 * @param {Object} data
 */
export function generateOperateScheduleList(data,calendarList){
  let n = 0;
  let scheduleList = new Array();
  for(let i=0; i<data.length; i++){
    let pdata =data[i].operations;
    for(let j=0;j<pdata.length;j++){
      let title = pdata[j].content;
      let uc = {
          id : ++n,
          behaviorTypeIndex: pdata[j].behaviorTypeIndex,
          title:title,
          content:pdata[j].content,
          readOnly:true,
          bussDay:pdata[j].occurTime,
          expireTime:pdata[j].occurTime,
          allDay:false,
          delayCounts:0,
          location:data[i].title,
          remark:'无'
      };
      let sd = generateUserSchedule(uc,calendarList);
      scheduleList.push(sd);
    }
  }
  return {total:n,list:scheduleList};
}

export function generateUserSchedule(uc,calendarList){
  let schedule = new ScheduleInfo();
  //严格来说，需要通过behaviorType来查询
  let calendar = calendarList[uc.behaviorTypeIndex];
  schedule.id = uc.id;
  schedule.calendarId = calendar.id;
  schedule.title = uc.title;
  schedule.body = uc.content;
  schedule.isReadOnly = true;
  generateUserCalendarTime(uc,schedule);
  schedule.isPrivate = false;
  if(null!=uc.location){
      schedule.location=uc.location;
  }
  //参与者，目前为超链接
  schedule.attendees = [];
  schedule.recurrenceRule = uc.delayCounts>0 ? '延迟次数:'+uc.delayCounts : '';
  schedule.state = 'Free';
  schedule.color = calendar.color;
  schedule.bgColor = calendar.bgColor;
  schedule.dragBgColor = calendar.dragBgColor;
  schedule.borderColor = calendar.borderColor;

  if (schedule.category === 'milestone') {
      schedule.color = schedule.bgColor;
      schedule.bgColor = 'transparent';
      schedule.dragBgColor = 'transparent';
      schedule.borderColor = 'transparent';
  }
  schedule.raw.memo = uc.remark;
  return schedule;
}

export function generateUserCalendarTime(uc,schedule) {
  schedule.isAllday = uc.allDay;
  schedule.start = new Date(uc.bussDay.replace(/-/,"/"));
  schedule.end = new Date(uc.expireTime.replace(/-/,"/"));
  schedule.goingDuration = 5;
  schedule.comingDuration = 5;
  //The schedule type('milestone', 'task', allday', 'time')
  if (schedule.isAllday) {
      schedule.category = 'allday';
  }else {
      schedule.category = 'time';
  }
}

export function ScheduleInfo() {
  this.id = null;
  this.calendarId = null;

  this.title = null;
  this.body = null;
  this.isAllday = false;
  this.start = null;
  this.end = null;
  this.category = '';
  this.dueDateClass = '';

  this.color = null;
  this.bgColor = null;
  this.dragBgColor = null;
  this.borderColor = null;
  this.customStyle = '';

  this.isFocused = false;
  this.isPending = false;
  this.isVisible = true;
  this.isReadOnly = false;
  this.goingDuration = 0;
  this.comingDuration = 0;
  this.recurrenceRule = '';
  this.state = '';

  this.raw = {
    memo: '',
    hasToOrCc: false,
    hasRecurrenceRule: false,
    location: null,
    class: 'public', // or 'private'
    creator: {
        name: '',
        avatar: '',
        company: '',
        email: '',
        phone: ''
    }
  };
}

/**
 * 组装日历类别
 *
 * @param {Object} data
 */
export function generateDateRange(tuiCal){
  const {invoke} = tuiCal;
  const view = invoke('getViewName');
  const calDate = invoke('getDate');
  const rangeStart = invoke('getDateRangeStart');
  const rangeEnd = invoke('getDateRangeEnd');
  let year = calDate.getFullYear();
  let month = calDate.getMonth() + 1;
  let date = calDate.getDate();
  let dateRangeText = '';
  let endMonth, endDate, start, end;
  switch (view) {
    case 'month':
      dateRangeText = `${year}-${month}`;
      break;
    case 'week':
      year = rangeStart.getFullYear();
      month = rangeStart.getMonth() + 1;
      date = rangeStart.getDate();
      endMonth = rangeEnd.getMonth() + 1;
      endDate = rangeEnd.getDate();
      start = `${year}-${month}-${date}`;
      end = `${endMonth}-${endDate}`;
      dateRangeText = `${start} ~ ${end}`;
      break;
    default:
      dateRangeText = `${year}-${month}-${date}`;
  }
  return dateRangeText;
}
