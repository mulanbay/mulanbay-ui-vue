<template>
  <div>
    <div id="lnb-tui">
      <div class="lnb-new-schedule" align="center">
        <el-button type="primary" icon="el-icon-plus" size="medium" style="width: 160px;" round @click="handleCreate" >新增</el-button>
      </div>
      <div id="lnb-calendars" class="lnb-calendars">
        <div>
          <div class="lnb-calendars-item" align="center" >
            <el-select
              v-model="queryParams.sourceType"
              @change="handleSourceTypeTypeChange"
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
          <div align="left">
            <label>
                <el-checkbox v-model="queryParams.needFinished" @change="handleSourceTypeTypeChange">已完成日历</el-checkbox>
            </label>
            <label>
                <el-checkbox v-model="queryParams.needPeriod" @change="handleSourceTypeTypeChange">周期性日历</el-checkbox>
            </label>
            <label>
                <el-checkbox v-model="queryParams.needBudget" @change="handleSourceTypeTypeChange">预算日历</el-checkbox>
            </label>
            <label>
                <el-checkbox v-model="queryParams.needTreatDrug" @change="handleSourceTypeTypeChange">用药日历</el-checkbox>
            </label>
          </div>
        </div>
        <div>
            <div class="lnb-calendars-item">
                <label>
                    <el-checkbox v-model="queryParams.needBandLog" @change="handleSourceTypeTypeChange">周期性日历完成情况</el-checkbox>
                </label>
            </div>
        </div>
        <div>
          <el-input
            v-model="queryParams.name"
            placeholder="关键字搜索"
            clearable
            size="small"
            style="width: 160px"
            @keyup.enter.native="getScheduleList"
          />
        </div>
        <div>
          <div class="lnb-calendars-item" align="center">
            一共<span style="color: red;">{{totalCalendars}}</span>个日历
          </div>
        </div>
      </div>
      <div>
        <div class="lnb-calendars-item" align="center">
          <el-button type="primary" icon="el-icon-refresh" size="medium" style="width: 160px;" round @click="getScheduleList">刷新</el-button>
        </div>
      </div>
      <div>
        <div class="lnb-calendars-item" align="center">
          <el-button type="success" icon="el-icon-s-grid" size="medium" style="width: 160px;" round @click="showListView">列表</el-button>
        </div>
      </div>
      <div>
        <div class="lnb-calendars-item" align="center">
          <el-button type="success" icon="el-icon-timer" size="medium" style="width: 160px;" round @click="handleDaily">每日</el-button>
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
          <el-button type="primary" icon="el-icon-timer" size="small" round @click="moveTo('today')">今天</el-button>
          <el-button type="success" icon="el-icon-d-arrow-left" size="small" round @click="moveTo('prev')">往前</el-button>
          <el-button type="success" icon="el-icon-d-arrow-right" size="small" round @click="moveTo('next')">往后</el-button>
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
        @beforeCreateSchedule="onBeforeCreateSchedule"
        @beforeDeleteSchedule="onBeforeDeleteSchedule"
        @beforeUpdateSchedule="onBeforeUpdateSchedule"
        @afterRenderSchedule="onAfterRenderSchedule"
        @clickTimezonesCollapseBtn="onClickTimezonesCollapseBtn" />
    </div>

    <!-- 表单 -->
    <el-dialog :title="title" width="800px" :visible.sync="open">
      <user-calendar-detail :userCalendarData="userCalendarData" @closeMe="closeDetail" @refreshList="getScheduleList"/>
    </el-dialog>

    <!-- 来源详情 -->
    <el-dialog :title="sourceTitle" width="600px" :visible.sync="sourceOpen"  append-to-body>
      <source-detail :jsonData="jsonData"/>
    </el-dialog>

    <!-- 每日日历 -->
    <el-dialog :title="dcTitle" width="600px" :visible.sync="dcOpen"  append-to-body customClass="customDialogCss">
      <daily-calendar/>
    </el-dialog>

  </div>
</template>
<script>
  import 'tui-time-picker/dist/tui-time-picker.css';
  import 'tui-date-picker/dist/tui-date-picker.css';
  import 'tui-calendar/dist/tui-calendar.css';
  import '@/components/tui-calendar/app.css';
  import {Calendar} from '@/components/tui-calendar/index';
  import myTheme from '@/components/tui-calendar/myTheme';
  import moment from 'moment';

  import {
    generateCalendarScheduleList,
    generateCalendarList,
    viewModeOptions,
    timezones,
    template,
    generateCalendarCheck,
    generateDateRange
  } from "@/utils/calendarUtils";
  import {getList,createUserCalendar2,updateUserCalendar,deleteUserCalendar,finishUserCalendar,getUserCalendarSource} from "@/api/data/userCalendar";
  import {getUserMessageByUser} from "@/api/log/userMessage";
  import UserCalendarDetail from './detail'
  import DailyCalendar from './dailyCalendar'
  import SourceDetail from '../../common/jsonTreeTable'

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
    name: 'UserCalendarMyCalendar',
    components: {
      'calendar': Calendar,
      'user-calendar-detail':UserCalendarDetail,
      'daily-calendar':DailyCalendar,
      'source-detail':SourceDetail
    },
    data() {
      return {
        //日历明细 start
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 详情数据
        userCalendarData:{
          id:undefined
        },
        //日历明细 end
        //每日日历 start
        dcTitle:undefined,
        dcOpen:false,
        //每日日历 end
        //来源详情 start
        // 弹出层标题
        sourceTitle: "",
        // 是否显示弹出层
        sourceOpen: false,
        // 详情数据
        jsonData:{
          jsonObject:undefined
        },
        //来源详情 end
        queryParams:{
          needFinished:false,
          needPeriod:true,
          needBudget:true,
          needTreatDrug:false,
          needBandLog:false
        },
        totalCalendars: 0,
        viewModeOptions: viewModeOptions,
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
    watch: {
      selectedView(newValue) {
        this.$refs.tuiCal.invoke('changeView', newValue, true);
        this.getScheduleList();
      }
    },
    methods: {
      init() {
        //初始化日历组件
        this.getEnumTree('UserCalendarSource', 'FIELD', false).then(response => {
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
      //切换到列表模式
      showListView(){
        //路由定向
        this.$router.push({name:'UserCalendar',query: {}})
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
        this.getUserCalendarList(startDate,endDate);
      },
      /** 关闭详情操作 */
      closeDetail(){
        this.open = false;
      },
      /** 每日日历按钮操作 */
      handleDaily() {
        this.dcOpen = true;
        this.dcTitle = "每日日历";
      },
      /** 新增按钮操作 */
      handleCreate() {
        this.open = true;
        this.title = "添加";
        this.userCalendarData = Object.assign({}, this.userCalendarData, {
          id: undefined,
        });
      },
      /** 修改按钮操作 */
      handleUpdate(id) {
        this.open = true;
        this.title = "添加";
        this.userCalendarData = Object.assign({}, this.userCalendarData, {
          id: id,
        });
      },
      //选择日历类型处理
      handleSourceTypeTypeChange(){
        this.getScheduleList();
      },
      //选择视图模式
      moveTo(action) {
        this.$refs.tuiCal.invoke(action);
        this.getScheduleList();
      },
      //选择日历
      onClickSchedule(res) {
        //this.msgAlert('提示','日历:'+res.schedule.title);
      },
      onClickDayname(res) {
        // 适用视图模式view : week, day
        this.msgAlert('提示','日历日期:'+res.date);
      },
      //新建日历
      onBeforeCreateSchedule(e){
        let postData={
          calendarId:e.calendarId,
          title:e.title,
          allDay:e.isAllDay,
          location:e.location
        };
        if(e.start){
          postData.bussDay=moment(e.start._date).format('YYYY-MM-DD HH:mm:ss');
        }
        if(e.end){
          postData.expireTime=moment(e.end._date).format('YYYY-MM-DD HH:mm:ss');
        }
        createUserCalendar2(postData).then(response => {
          //刷新
          this.msgSuccess('新增成功');
          this.getScheduleList();
        });
      },
      //更新日历
      onBeforeUpdateSchedule(res) {
        let changes = res.changes;
        if(changes==null){
          return;
        }
        let schedule = res.schedule;
        let postData={
          id:schedule.id,
          sourceType:res.calendar.id,
          title:schedule.title,
          allDay:schedule.isAllDay,
          location:schedule.location
        };
        for(let key in changes) {
          if(postData[key]){
            postData[key] = changes[key];
          }
        }
        if(changes['isAllDay']){
          postData.allDay=changes.isAllDay;
        }
        if(changes.start){
          postData.bussDay=moment(changes.start._date).format('YYYY-MM-DD HH:mm:ss');
        }
        if(changes.end){
          postData.expireTime=moment(changes.end._date).format('YYYY-MM-DD HH:mm:ss');
        }
        updateUserCalendar(postData).then(response => {
          //刷新
          this.msgSuccess('更新成功');
          this.getScheduleList();
        });
      },
      //删除日历
      onBeforeDeleteSchedule(res) {
        this.$confirm('是否确认关闭日历"' + res.schedule.title + '"?', "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(function() {
            return finishUserCalendar(res.schedule.id);
          }).then(() => {
            this.msgSuccess("删除成功");
            const idx = this.scheduleList.findIndex(item => item.id === res.schedule.id);
            this.scheduleList.splice(idx, 1);
          }).catch(function() {});
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
      //获取用户日历
      getUserCalendarList(startDate, endDate) {
        this.queryParams.startDate=startDate;
        this.queryParams.endDate=endDate;
        getList(this.queryParams).then(response => {
          let sds = generateCalendarScheduleList(response, this.calendarList);
          this.scheduleList = sds.list;
          this.totalCalendars = sds.total;
        });
      },
      //源消息内容
      showOriginMessage(id){
        getUserMessageByUser(id).then(
          response => {
            if(response==null){
              this.msgError('未找到相关消息内容');
            }else{
              this.msgAlert(response.title, response.content);
            }
          }
        );
      },
      //来源信息
      showCalendarSource(id){
        getUserCalendarSource(id).then(
          response => {
            if(response==null){
              this.msgError('未找到源内容');
            }else{
              this.sourceOpen = true;
              this.sourceTitle = "源内容详情";
              this.jsonData = Object.assign({}, this.jsonData, {
                jsonObject: response,
              });
            }
          }
        );
      }
    },
    mounted() {
      /**
       * 定义方法，供JavaScript直接调用，在calendarUtils有直接调用
       * tui-calendar中的页面无法直接使用Element UI的元素
       */
      window.handleUpdate = this.handleUpdate;
      window.showOriginMessage = this.showOriginMessage;
      window.showCalendarSource = this.showCalendarSource;
      this.init();
    }
  };
</script>
