<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="关联业务" prop="relatedBeans">
        <el-select
        v-model="queryParams.relatedBeans"
        style="width: 240px"
        clearable
        @change="loadUserPlan"
        placeholder="请选择">
        <el-option
          v-for="dict in relatedBeansOptions"
          :key="dict.id"
          :label="dict.text"
          :value="dict.id"
        />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="选取计划" prop="userPlanId">
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
      <el-form-item v-if="queryParams.dataType=='HISTORY'" label="起止日期">
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

    <el-row v-loading="loading" >
      <template v-for="item in planReportList">
        <el-col :span="12" class="card-box">
          <el-card>
            <el-col :span="12">
              <div class="el-table el-table--enable-row-hover el-table--medium">
              <table cellspacing="0" style="width: 100%;">
                <tbody>
                  <tr>
                    <td><div class="cell">计划编号</div></td>
                    <td><div class="cell">{{ item.id }}</div></td>
                  </tr>
                  <tr>
                    <td><div class="cell">计划名称</div></td>
                    <td>
                      <div class="cell">
                      {{ formatName(item) }}
                      <span class="link-type" @click="handleDispatch(item.userPlan.planConfig.url)"><i class="el-icon-s-promotion" /></span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td><div class="cell">计划类型</div></td>
                    <td><div class="cell">{{ item.userPlan.planConfig==null ? '--': item.userPlan.planConfig.planTypeName}}</div></td>
                  </tr>
                  <tr>
                    <td><div class="cell">业务日期</div></td>
                    <td><div class="cell">{{ item.bussDay }}</div></td>
                  </tr>
                  <tr>
                    <td><div class="cell">次数统计</div></td>
                    <td><div class="cell">{{ item.reportCountValue+'次(计划:'+item.planCountValue+'次)' }}</div></td>
                  </tr>
                  <tr>
                    <td><div class="cell">值统计</div></td>
                    <td><div class="cell">{{ item.reportValue+item.userPlan.unit+'(计划:'+item.planValue+item.userPlan.unit+')' }}</div></td>
                  </tr>
                  <tr>
                    <td><div class="cell">比较类型</div></td>
                    <td><div class="cell">{{ item.userPlan.planConfig.compareTypeName }}</div></td>
                  </tr>
                  <tr>
                    <td><div class="cell">数据参考年份</div></td>
                    <td><div class="cell">{{ item.planConfigYear }}</div></td>
                  </tr>
                </tbody>
              </table>
              </div>
            </el-col>
            <el-col :span="12">
              <div>
              <table cellspacing="0" style="width: 100%;">
                <tbody>
                  <tr>
                    <td align="center">
                      <span v-if="'MORE'==item.userPlan.planConfig.compareType">
                       <el-progress type="dashboard" :width="150" :percentage="item.cp" :color="moreColors"></el-progress>
                      </span>
                      <span v-else>
                       <el-progress type="dashboard" :width="150" :percentage="item.cp" :color="lessColors"></el-progress>
                      </span>
                    </td>
                    <td align="center">
                      <span v-if="'MORE'==item.userPlan.planConfig.compareType">
                       <el-progress type="dashboard" :width="150" :percentage="item.vp" :color="moreColors"></el-progress>
                      </span>
                      <span v-else>
                       <el-progress type="dashboard" :width="150" :percentage="item.vp" :color="lessColors"></el-progress>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td align="center"><div class="cell"><i class="el-icon-info"></i>次数进度</div></td>
                    <td align="center"><div class="cell"><i class="el-icon-info"></i>值进度</div></td>
                  </tr>
                  <tr>
                    <td align="center"></td>
                  </tr>
                </tbody>
              </table>
              </div>
              <div class="el-table el-table--enable-row-hover el-table--medium">
              <table cellspacing="0" style="width: 100%;">
                <tbody>
                  <tr>
                    <td><div class="cell">统计日期</div></td>
                    <td><div class="cell">{{ item.bussStatDate.substring(0,10) }}</div></td>
                  </tr>
                  <tr>
                    <td><div class="cell">统计时间</div></td>
                    <td><div class="cell">{{ item.createdTime }}</div></td>
                  </tr>
                  <tr>
                    <td><div class="cell">进度统计</div></td>
                    <td><div class="cell"><span class="link-type" @click="timelineStat(item)"><i class="el-icon-s-data" /></span></div></td>
                  </tr>
                  <tr>
                    <td><div class="cell">计划统计</div></td>
                    <td><div class="cell"><span class="link-type" @click="planStat(item)"><i class="el-icon-s-data" /></span></div></td>
                  </tr>
                </tbody>
              </table>
              </div>
            </el-col>
          </el-card>
        </el-col>
      </template>
    </el-row>

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
  import {getBussTypeTree} from "@/api/common";
  import {getValueCompareResult,getCompareYearString,getPercent} from "@/utils/planUtils";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import TimelineStat from '../planReport/timelineStat'
  import PlanStat from './stat'
  import NotifyStat from '../../notify/userNotify/stat'

export default {
  name: "UserPlanCommonStat",
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
      //大于类进度显示环颜色
      moreColors: [
        {color: '#f56c6c', percentage: 20},
        {color: '#e6a23c', percentage: 40},
        {color: '#6f7ad3', percentage: 60},
        {color: '#1989fa', percentage: 80},
        {color: '#5cb87a', percentage: 100}
      ],
      //小于类进度显示环颜色
      lessColors: [
        {color: '#f56c6c', percentage: 100},
        {color: '#e6a23c', percentage: 80},
        {color: '#6f7ad3', percentage: 60},
        {color: '#1989fa', percentage: 40},
        {color: '#5cb87a', percentage: 20}
      ],
      relatedBeansOptions:[],
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
        statNow:true,
        relatedBeans:undefined
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
    this.loadUserPlan();
    this.getEnumTree('PlanType','FIELD',false).then(response => {
      this.planTypeOptions = response;
    });
    this.getEnumTree('PlanReportDataStatFilterType','FIELD',false).then(response => {
      this.filterTypeOptions = response;
    });
    getBussTypeTree(false).then(response => {
      this.relatedBeansOptions = response;
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
    //路由跳转
    handleDispatch(name) {
      //路由定向
      this.$router.push({name:name,query: {}})
    },
    /** 加载用户计划 */
    loadUserPlan(){
      this.getUserPlanOptionsTreeselect(this.queryParams.planType,this.queryParams.relatedBeans);
    },
    /** 格式化名称，计算各数值 */
    formatName(row){
      if(!this.isObjectEmpty(row.reportCountValue)){
        //完成值与进度
        row.cp = getPercent(row.reportCountValue,row.planCountValue);
        row.vp = getPercent(row.reportValue,row.planValue);
      }else{
        row.cp = 0;
        row.vp = 0;
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
