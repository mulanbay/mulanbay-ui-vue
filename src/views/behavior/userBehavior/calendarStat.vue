<template>
  <div>
    <div id="lnb-tui">
      <div class="lnb-new-schedule" align="center">
        <el-button type="primary" size="medium" style="width: 160px;" round disabled>新增</el-button>
      </div>
      <div id="lnb-calendars" class="lnb-calendars">
        <div>
          <div class="lnb-calendars-item" align="center" >
            <el-select
              v-model="behaviorType"
              @change="handleBehaviorTypeChange"
              clearable
              placeholder="请选择类型"
              style="width: 160px">
              <el-option
                v-for="item in calendarList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </div>
        </div>
        <div>
          <div class="lnb-calendars-item" align="center" >
            <span>
              <el-select
                v-model="dataSource"
                @change="getScheduleList"
                placeholder="数据来源"
                collapse-tags
                size="small"
                style="width: 160px"
              >
                <el-option
                  v-for="dict in dataSourceOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </span>
          </div>
        </div>
        <div>
          <div class="lnb-calendars-item" align="center">
            一共<span style="color: red;">{{totalCalendars}}</span>个日历
          </div>
        </div>
        <div>
          <div class="lnb-calendars-item" align="center">
            <label>
                <el-checkbox @change="showWeekends">显示周末</el-checkbox>
            </label>
          </div>
        </div>
      </div>
      <div>
        <div class="lnb-calendars-item" align="center">
          <el-button type="primary" size="medium" style="width: 160px;" round @click="getScheduleList">刷新</el-button>
        </div>
      </div>
    </div>
    <div id='right-tui'>
      <div>
        <el-select v-model="selectedView" style="width: 160px">
          <el-option v-for="item in viewModeOptions" :key="item.value" :label="item.title" :value="item.value">
          </el-option>
        </el-select>
        <span>
          <el-button type="primary" size="small" round @click="moveTo('today')">今天</el-button>
          <el-button type="success" size="small" round @click="moveTo('prev')">往前</el-button>
          <el-button type="success" size="small" round @click="moveTo('next')">往后</el-button>
        </span>
        <span class="render-range">{{dateRange}}</span>
      </div>
      <calendar
        style="height: 800px"
        ref="tuiCal"
        :useDetailPopup="useDetailPopup"
        :view="selectedView"
        :calendars="calendarList"
        :schedules="scheduleList"
        :theme="theme"
        :template="template"
        :taskView="true"
        :scheduleView="true"
        :month="month"
        :week="week"
        :timezones="timezones"
        :disableDblClick="disableDblClick"
        :isReadOnly="isReadOnly"
        @clickSchedule="onClickSchedule"
        @clickDayname="onClickDayname"
        @beforeDeleteSchedule="onBeforeDeleteSchedule"
        @afterRenderSchedule="onAfterRenderSchedule"
        @clickTimezonesCollapseBtn="onClickTimezonesCollapseBtn" />
    </div>
  </div>
</template>
<script>
  import 'tui-time-picker/dist/tui-time-picker.css';
  import 'tui-date-picker/dist/tui-date-picker.css';
  import 'tui-calendar/dist/tui-calendar.css';
  import '@/components/tui-calendar/app.css';
  import {
    Calendar
  } from '@/components/tui-calendar/index';
  import myTheme from '@/components/tui-calendar/myTheme';
  import moment from 'moment';

  import {
    generateBehaviorScheduleList,
    generateOperateScheduleList,
    generateCalendarList,
    viewModeOptions,
    timezones,
    template,
    generateCalendarCheck,
    generateDateRange
  } from "@/utils/calendarUtils";
  import {getUserBehaviorCalendarStat} from "@/api/behavior/userBehavior";
  import {getUserOperationConfigStat} from "@/api/behavior/userOperationConfig";


  const today = new Date();
  const getDate = (type, start, value, operator) => {
    start = new Date(start);
    type = type.charAt(0).toUpperCase() + type.slice(1);
    if (operator === '+') {
      start[`set${type}`](start[`get${type}`]() + value);
    } else {
      start[`set${type}`](start[`get${type}`]() - value);
    }
    return start;
  };
  export default {
    name: 'CalendarStat',
    components: {
      'calendar': Calendar
    },
    data() {
      return {
        behaviorType:null,
        //数据源
        dataSource:'BEHAVIOR_DATA',
        totalCalendars: 0,
        viewModeOptions: viewModeOptions,
        dataSourceOptions:[],
        dateRange: '',
        useCreationPopup: true,
        useDetailPopup: true,
        selectedView: 'month',
        calendarList: [],
        scheduleList: [],
        timezones: timezones,
        theme: myTheme,
        template: template,
        month: {
          startDayOfWeek: 0,
          daynames: ['日', '一 ', '二', '三', '四', '五', '六']
        },
        week: {
          showTimezoneCollapseButton: true,
          timezonesCollapsed: true,
          daynames: ['日', '一 ', '二', '三', '四', '五', '六']
        },
        taskView: true,
        scheduleView: true,
        useDetailPopup: true,
        disableDblClick: true,
        isReadOnly: false
      };
    },
    created() {
      this.getDictItemTree('USER_BEHAVIOR_DATA_SOURCE',false).then(response => {
        this.dataSourceOptions = response;
      });
    },
    watch: {
      selectedView(newValue) {
        this.$refs.tuiCal.invoke('changeView', newValue, true);
        this.getScheduleList();
      }
    },
    methods: {
      init() {
        //初始化日历组件
        this.getEnumTree('UserBehaviorType', 'FIELD', false).then(response => {
          this.calendarList = generateCalendarList(response);
        });
        this.getScheduleList();
      },
      //是否显示周末
      showWeekends(){
        let options = this.$refs.tuiCal.options;
        options.month.workweek = !options.month.workweek;
        options.week.workweek = !options.week.workweek;
      },
      //获取列表
      getScheduleList() {
        this.dateRange = generateDateRange(this.$refs.tuiCal);
        const {invoke} = this.$refs.tuiCal;
        const rangeStart = invoke('getDateRangeStart');
        const rangeEnd = invoke('getDateRangeEnd');
        invoke('clear');
        //计算时间差了一个小时
        let startDate = moment(new Date(rangeStart + 3600 * 1000)).format('YYYY-MM-DD');
        let endDate = moment(new Date(rangeEnd + 3600 * 1000)).format('YYYY-MM-DD');
        if(this.dataSource=='BEHAVIOR_DATA'){
          this.getBehaviorCalendarList(startDate, endDate);
        }else{
          this.getUserOperationCalendarList(startDate, endDate);
        }
      },
      //选择日历类型处理
      handleBehaviorTypeChange(){
        //console.log(this.behaviorType);
        this.getScheduleList();
      },
      //选择视图模式
      moveTo(action) {
        this.$refs.tuiCal.invoke(action);
        this.getScheduleList();
      },
      //选择时间
      onClickSchedule(res) {
        console.group('onClickSchedule');
        console.log('MouseEvent : ', res.event);
        console.log('Calendar Info : ', res.calendar);
        console.log('Schedule Info : ', res.schedule);
        console.groupEnd();
      },
      onClickDayname(res) {
        // view : week, day
        console.group('onClickDayname');
        console.log(res.date);
        console.groupEnd();
      },
      //删除日历
      onBeforeDeleteSchedule(res) {
        console.group('onBeforeDeleteSchedule');
        console.log('Schedule Info : ', res.schedule);
        console.groupEnd();
        const idx = this.scheduleList.findIndex(item => item.id === res.schedule.id);
        this.scheduleList.splice(idx, 1);
      },
      onAfterRenderSchedule(res) {
        //console.group('onAfterRenderSchedule');
        //console.log('Schedule Info : ', res.schedule);
        console.groupEnd();
      },
      onClickTimezonesCollapseBtn(timezonesCollapsed) {
        // view : week, day
        console.group('onClickTimezonesCollapseBtn');
        console.log('Is Collapsed Timezone? ', timezonesCollapsed);
        console.groupEnd();
        if (timezonesCollapsed) {
          this.theme['week.timegridLeft.width'] = '100px';
          this.theme['week.daygridLeft.width'] = '100px';
        } else {
          this.theme['week.timegridLeft.width'] = '50px';
          this.theme['week.daygridLeft.width'] = '50px';
        }
      },
      //获取用户行为日历
      getBehaviorCalendarList(startDate, endDate) {
        //计算时间差了一个小时
        let para = {
          startDate: startDate,
          endDate: endDate,
          behaviorType:this.behaviorType
        };
        getUserBehaviorCalendarStat(para).then(response => {
          let sds = generateBehaviorScheduleList(response, this.calendarList);
          this.scheduleList = sds.list;
          this.totalCalendars = sds.total;
        });
      },
      getUserOperationCalendarList(startDate, endDate){
        //计算时间差了一个小时
        let para = {
          startTime: startDate,
          endTime: endDate+' 23:59:59',
          behaviorType:this.behaviorType,
          page:0
        };
        getUserOperationConfigStat(para).then(response => {
          let sds = generateOperateScheduleList(response, this.calendarList);
          this.scheduleList = sds.list;
          this.totalCalendars = sds.total;
        });
      }
    },
    mounted() {
      this.init();
    }
  };
</script>
