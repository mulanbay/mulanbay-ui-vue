<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="选取计划" prop="userPlanId">
       <treeselect
        v-model="queryParams.userPlanId"
        @input="handleQuery"
        style="width: 240px"
        :options="userPlanOptions"
        :disable-branch-nodes="true"
        :show-count="true"
        :searchable="true"
        placeholder="请选择"
        />
      </el-form-item>
      <el-form-item label="起止日期">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          unlink-panels
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </el-form-item>
      <el-form-item  v-if="moreCdn==true" label="计划类型" prop="planType">
        <el-select
          v-model="queryParams.planType"
          style="width: 120px"
          clearable
          placeholder="请选择">
          <el-option
            v-for="dict in planTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="数据类型" prop="filterType">
        <el-select
          v-model="queryParams.filterType"
          placeholder="状态"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in filterTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="数据来源" prop="dataType">
        <el-radio-group v-model="queryParams.dataType">
          <el-radio label="LATEST">最新</el-radio>
          <el-radio label="HISTORY">历史</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['report:plan:userPlan:commonStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="notifyStat" v-hasPermi="['report:plan:userPlan:commonStat']">提醒统计</el-button>
        
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="planReportList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center" width="160" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ formatName(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.userPlan.planConfig==null ? '--': row.userPlan.planConfig.planTypeName}}</span>
        </template>
      </el-table-column>
      <el-table-column label="业务日期" align="center" width="150">
        <template slot-scope="{row}">
          <span>{{ row.bussDay }}</span>
        </template>
      </el-table-column>
      <el-table-column label="次数值" align="center" :show-overflow-tooltip="true" width="150">
        <template slot-scope="{row}">
          <span v-if="row.cf=='T'">
           <span style="color:green">{{ row.cv }}&nbsp;<i class="el-icon-check" /></span>
          </span>
          <span v-else-if="row.cf=='F'">
           <span style="color:red">{{ row.cv }}</span>
          </span>
          <span v-else>
           <span>{{ row.cv }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="值" align="center" :show-overflow-tooltip="true" width="150">
        <template slot-scope="{row}">
          <span v-if="row.vf=='T'">
           <span style="color:green">{{ row.vv }}&nbsp;<i class="el-icon-check" /></span>
          </span>
          <span v-else-if="row.vf=='F'">
           <span style="color:red">{{ row.vv }}</span>
          </span>
          <span v-else>
           <span>{{ row.vv }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="比较类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.userPlan.planConfig.compareTypeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划次数" align="center">
        <template slot-scope="{row}">
          <span>{{ row.planCountValue+'次' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划值" align="center">
        <template slot-scope="{row}">
          <span>{{ row.planValue==0 ? '--' : row.planValue +row.userPlan.unit}}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据参考年份" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.planConfigYear }}</span>
        </template>
      </el-table-column>
      <el-table-column label="进度统计" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="timelineStat(row)"><i class="el-icon-s-data" /></span>
        </template>
      </el-table-column>
      <el-table-column label="计划统计" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="planStat(row)"><i class="el-icon-s-data" /></span>
        </template>
      </el-table-column>
      <el-table-column label="统计日期" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.bussStatDate.substring(0,10) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.createdTime }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />


    <!-- 进度统计 -->
    <el-dialog :title="timelineTitle" width="900px" :visible.sync="timelineOpen">
      <timeline-stat :userPlanData="userPlanData"/>
    </el-dialog>

    <!-- 计划页面 -->
    <el-dialog :title="planTitle" width="800px" :visible.sync="planOpen"  append-to-body>
      <plan-stat :userPlanData="userPlanData"/>
    </el-dialog>

    <!-- 提醒统计页面 -->
    <el-dialog :title="notifyTitle" width="800px" :visible.sync="notifyOpen"  append-to-body>
      <notify-stat :userNotifyData="userNotifyData"/>
    </el-dialog>
    
  </div>
</template>

<script>
  import {fetchList as fetchPlanReportList} from "@/api/report/plan/planReport";
  import {fetchList as fetchUserPlanList} from "@/api/report/plan/userPlan";
  import {getUserPlanTree} from "@/api/report/plan/userPlan";
  import {deepClone,getQueryObject} from "@/utils/index";
  import {getValueCompareResult,getCompareYearString} from "@/utils/planUtils";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import TimelineStat from '../planReport/timelineStat'
  import PlanStat from './stat'
  import NotifyStat from '../../notify/userNotify/stat' 
  
export default {
  name: "CommonStat",
  components: {
    Treeselect,
    'timeline-stat':TimelineStat,
    'plan-stat':PlanStat,
    'notify-stat':NotifyStat
  },
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      //提醒统计
      notifyTitle:'',
      notifyOpen:false,
      userNotifyData:{},
      //进度统计
      timelineTitle:'',
      timelineOpen:false,
      userPlanData:{},
      //计划统计
      planTitle:'',
      planOpen:false,
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 列表数据
      planReportList:[],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        dataType:'LATEST',
        filterType:'ORIGINAL',
        status:'ENABLE',
        statNow:true
      },
      booleanOptions:this.booleanOptions,
      //用户计划
      userPlanOptions:[],
      planTypeOptions:[],
      filterTypeOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      }
    };
  },
  created() {
    //获取URL参数
    let qb = getQueryObject(null);
    if(!this.isObjectEmpty(qb.beanName)){
      this.queryParams.relatedBeans = qb.beanName;
    }
    this.getList();
    this.getUserPlanOptionsTreeselect(this.queryParams.planType,this.queryParams.relatedBeans);
    this.getEnumTree('PlanType','FIELD',false).then(response => {
      this.planTypeOptions = response;
    });
    this.getEnumTree('PlanReportDataStatFilterType','FIELD',false).then(response => {
      this.filterTypeOptions = response;
    });
  },
  methods: {
    /** 更多查询条件处理 */
    handleMoreCdn(){
      if(this.moreCdn==true){
        //this.resetForm("queryForm");
        this.moreCdn=false;
        this.cdnTitle='更多';
      }else{
        this.moreCdn=true;
        this.cdnTitle='取消';
      }
    },
    /** 格式化名称，计算各数值 */
    formatName(row){
      if(!this.isObjectEmpty(row.reportCountValue)){
        //完成值与进度
        let countResult = getValueCompareResult(row.reportCountValue,row.planCountValue,row.userPlan.planConfig.compareType,'次');
        row.cf = countResult.finished;
        row.cv = countResult.valueStr;
        let valueResult = getValueCompareResult(row.reportValue,row.planValue,row.userPlan.planConfig.compareType,row.userPlan.unit);
        row.vf = valueResult.finished;
        row.vv = valueResult.valueStr;

      }
      return row.userPlan ==null ? '--' : row.userPlan.title;
    },
    /** 进度统计 */
    timelineStat(row){
      const dateGroupType = row.userPlan.planConfig.planType;
      this.timelineTitle="进度统计";
      this.timelineOpen=true;
      //赋值给子页面使用
      this.userPlanData = Object.assign({}, this.userPlanData, {
        userPlanId: row.userPlan.id,
        dateGroupType: dateGroupType,
        bussStatDate: row.bussStatDate
      });
      //路由定向
      //this.$router.push({name:'PlanReport/timelineStat',query: queryPara})
    },
    /** 计划统计 */
    planStat(row){
      this.planTitle='用户计划统计';
      this.planOpen=true;
      this.userPlanData = Object.assign({}, this.userPlanData, {
        id: row.userPlan.id,
        relatedBeans:this.queryParams.relatedBeans
      });
    },
    /** 提醒统计 */
    notifyStat(){
      this.notifyTitle='用户提醒统计';
      this.notifyOpen=true;
      this.userNotifyData = Object.assign({}, this.userNotifyData, {
        relatedBeans:this.queryParams.relatedBeans
      });
    },
    /** 查询搜索条件中的模板下拉树结构 */
    getUserPlanOptionsTreeselect(planType,relatedBeans) {
      getUserPlanTree(false,planType,relatedBeans).then(response => {
        this.userPlanOptions = response;
      });
    },
    /** 查询列表 */
    getList() {
      if(this.isObjectEmpty(this.queryParams.userPlanId)){
        // this.msgError('请先选择某个具体的计划');
        // return;
      }
      this.loading = true;
      if(this.queryParams.dataType=='LATEST'){
        //从用户计划中获取
        this.getUserPlanList();
      }else{
        this.getPlanReportList();
      }
    },
    /** 加载计划报告 */
    getUserPlanList(){
      fetchUserPlanList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //需要拼装成和用户计划一样的数据
          let list = new Array();
          const n = response.rows.length;
          for(let i=0;i<n;i++){
            let dd = response.rows[i].planReport;
            dd.userPlan = response.rows[i];
            dd.id=response.rows[i].id;
            list.push(dd);
          }
          this.planReportList = list;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** 加载计划报告 */
    getPlanReportList(){
      fetchPlanReportList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.planReportList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!=1
      this.multiple = !selection.length
    }
  }
};
</script>
