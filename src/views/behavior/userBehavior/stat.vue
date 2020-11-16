<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="统计类型" prop="dateGroupType">
        <el-radio-group v-model="queryParams.dateGroupType">
          <el-radio label="YEAR">年</el-radio>
          <el-radio label="MONTH">月</el-radio>
          <el-radio label="DAY">日</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="queryParams.dateGroupType == 'YEAR'" label="选择年份">
        <el-date-picker
          v-model="queryParams.year"
          type="year"
          size="small"
          value-format="yyyy"
          placeholder="选择年">
        </el-date-picker>
      </el-form-item>
      <el-form-item v-if="queryParams.dateGroupType == 'MONTH'" label="选择月份">
        <el-date-picker
          v-model="queryParams.yearMonth"
          type="month"
          size="small"
          value-format="yyyy-MM"
          placeholder="选择月份">
        </el-date-picker>
      </el-form-item>
      <el-form-item v-if="queryParams.dateGroupType == 'DAY'" label="选择日期">
        <el-date-picker
          type="date"
          v-model="queryParams.date"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          size="small"
          placeholder="请选择日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="选取配置" prop="userBehaviorId">
        <treeselect
         v-model="queryParams.userBehaviorId"
         @input="loadUserBehaviorKeywordsList"
         style="width: 240px"
         :options="userBehaviorOptions"
         :disable-branch-nodes="true"
         :show-count="true"
         :searchable="true"
         placeholder="请选择行为配置"
         />
      </el-form-item>
      <el-form-item label="配置子类" prop="name">
        <el-select
          v-model="queryParams.name"
          placeholder="配置子类"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in nameOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="数据分组" prop="dataType">
        <el-select
          v-model="queryParams.dataType"
          placeholder="数据分组"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in dataTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['behavior:userBehavior:stat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div>
      <common-chart :chartData="chartData"/>
    </div>

  </div>
</template>

<script>
  import {getUserBehaviorTree,getUserBehaviorKeywordsTree,getUserBehaviorStat} from "@/api/behavior/userBehavior";
  import CommonChart from '../../chart/commonChart'

  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Stat",
  components: {
    Treeselect,
    'common-chart':CommonChart
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      //图表数据
      chartData:{},
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      userBehaviorOptions:[],
      nameOptions:[],
      dataTypeOptions:[],
      // 查询参数
      queryParams: {
        dataType:'',
        dateGroupType:'MONTH',
        yearMonth:(new Date()).Format("yyyy-MM")
      }
    };
  },
  created() {
    this.initChart();
    getUserBehaviorTree(null,false).then(response => {
      this.userBehaviorOptions = response;
    });
    this.getDictItemTree('USER_BEHAVIOR_STAT_DATA_TYPE',false).then(response => {
      this.dataTypeOptions = response;
    });
  },
  //监听父层带过来的账户信息值
  watch:{

  },
  methods: {
    /** 查询该配置的关键字列表处理 */
    loadUserBehaviorKeywordsList(){
      const id = this.queryParams.userBehaviorId;
      if(this.isObjectEmpty(id)){
        this.nameOptions=[];
        return;
      }
      getUserBehaviorKeywordsTree(id,false).then(response => {
        this.nameOptions = response;
      });
    },
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.initChart();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.initChart();
    },
    initChart() {
      const dateGroupType = this.queryParams.dateGroupType;
      if(dateGroupType=='YEAR'){
        let v = this.queryParams.year;
        if(this.isObjectEmpty(v)){
          this.msgError('请选择年份');
          return;
        }
        this.queryParams.date = v+'-01-01';
      }else if(dateGroupType=='MONTH'){
        let v = this.queryParams.yearMonth;
        if(this.isObjectEmpty(v)){
          this.msgError('请选择月份');
          return;
        }
        this.queryParams.date = v+'-01';
      }else{
        if(this.isObjectEmpty(this.queryParams.date)){
          this.msgError('请选择时间');
          return;
        }
      }
      let isDt = !this.isObjectEmpty(this.queryParams.dataType);
      if(isDt&&this.queryParams.userBehaviorId==null){
          this.msgAlert('系统提示', '采用数据分组的必须选择某项具体配置!');
          return;
      }
      this.openLoading();
      getUserBehaviorStat(this.queryParams).then(
        response => {
          //组装chart数据
          if(isDt){
            //散点图
            response.chartType='SCATTER';
          }else if(dateGroupType=='YEAR'){
            response.chartType='CALANDER';
          }else if(dateGroupType=='MONTH'){
            response.chartType='CALANDER_PIE';
          }else{
            response.chartType='POLAR_BAR';
          }
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
