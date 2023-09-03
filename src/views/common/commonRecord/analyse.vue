<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
        <div>
          <el-form :model="queryParams" ref="queryForm" :inline="true">
            <el-form-item label="记录类型" prop="commonRecordTypeId">
              <el-select
                v-model="queryParams.commonRecordTypeId"
                placeholder="类型"
                clearable
                style="width: 240px"
                @change="handleCommonRecordTypeChange"
              >
                <el-option
                  v-for="dict in commonRecordTypeOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="子项名称" prop="name">
              <el-select
                v-model="queryParams.name"
                placeholder="子项名称"
                clearable
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
            <el-form-item label="分组类型" prop="groupField">
              <el-select
                v-model="queryParams.groupField"
                placeholder="分组类型"
                clearable
                style="width: 240px"
              >
                <el-option
                  v-for="dict in groupFieldOptions"
                  :key="dict.id"
                  :label="dict.text"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['common:commonRecord:analyse']">统计</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>

      <el-col :span="16" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <pie-chart ref="analyseChart" :chartData="analyseChartData"/>
          </div>
          <div align="center">
            <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleChartStat('TIMES')" >按次数</el-button>
            <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleChartStat('MINUTE')" >按时长</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8" class="card-box">
        <el-card>
          <div slot="header">
            <span>统计信息(基于当前查询条件)</span>
          </div>
          <div>
            <el-divider content-position="center">数据统计</el-divider>
            <el-descriptions class="margin-top" title="" :column="1" :size="size" border >
              <el-descriptions-item labelStyle="width: 120px">
                <template slot="label">
                  <i class="el-icon-data-board"></i>
                  时间跨度
                </template>
                <div class="cell">{{ statData.daysStr }}</div>
              </el-descriptions-item>
              <el-descriptions-item labelStyle="width: 120px">
                <template slot="label">
                  <i class="el-icon-info"></i>
                  总次数
                </template>
                <div class="cell">{{ statData.totalCount }}</div>
              </el-descriptions-item>
              <el-descriptions-item labelStyle="width: 120px">
                <template slot="label">
                  <i class="el-icon-date"></i>
                  总时长
                </template>
                <div class="cell">{{ statData.totalValue+statData.unit }}</div>
              </el-descriptions-item>
              <el-descriptions-item labelStyle="width: 120px">
                <template slot="label">
                  <i class="el-icon-data-line"></i>
                  平均时长
                </template>
                <div class="cell">{{ statData.perValue+statData.unit }}</div>
              </el-descriptions-item>
              <el-descriptions-item labelStyle="width: 120px">
                <template slot="label">
                  <i class="el-icon-data-board"></i>
                  平均频率
                </template>
                <div class="cell">{{ statData.frequency }}天/次</div>
              </el-descriptions-item>
            </el-descriptions>
            <el-divider content-position="center">最近记录</el-divider>
            <el-descriptions class="margin-top" title="" :column="1" :size="size" border >
              <el-descriptions-item labelStyle="width: 120px">
                <template slot="label">
                  <i class="el-icon-star-on"></i>
                  名称
                </template>
                <div class="cell">{{ latestData.name }}</div>
              </el-descriptions-item>
              <el-descriptions-item labelStyle="width: 120px">
                <template slot="label">
                  <i class="el-icon-date"></i>
                  时长
                </template>
                <div class="cell">{{ latestData.value }}分钟</div>
              </el-descriptions-item>
              <el-descriptions-item labelStyle="width: 120px">
                <template slot="label">
                  <i class="el-icon-location"></i>
                  地点
                </template>
                <div class="cell">{{ latestData.location }}</div>
              </el-descriptions-item>
              <el-descriptions-item labelStyle="width: 120px">
                <template slot="label">
                  <i class="el-icon-date"></i>
                  时间
                </template>
                <div class="cell">{{ latestData.occurTime }}</div>
              </el-descriptions-item>
              <el-descriptions-item labelStyle="width: 120px">
                <template slot="label">
                  <i class="el-icon-date"></i>
                  距今
                </template>
                <div class="cell">{{ getTillNow(latestData.occurTime) }}</div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" class="card-box">
        <el-card>
          <div slot="header">
            <span>时间线统计</span>
            -->预测:<el-switch v-model="predict" @change="timelineStat()"></el-switch>
          </div>
          <div class="chart-wrapper">
            <common-chart ref="timelineChart" :chartData="timelineChartData"/>
          </div>
        </el-card>
      </el-col>

    </el-row>
  </div>
</template>

<script>
  import {getCommonRecordTypeTree } from "@/api/common/commonRecordType";
  import {getCommonRecordAnalyse,getCommonRecordTimeline,getLatestCommonRecord,statCommonRecord,getNameTree} from "@/api/common/commonRecord";

  import {getPercent,progressColors,formatFloat} from "@/utils/mulanbay";
  import {dateDiff,tillNowDays,formatDays} from "@/utils/datetime";
  import {getQueryObject} from "@/utils/index";

  import PieChart from '../../chart/pieChart';
  import CommonChart from '../../chart/commonChart'
  import resize from '../../dashboard/mixins/resize.js'

export default {
  name: "CommonRecordAnalyse",
  mixins: [resize],
  components: {
    'pie-chart':PieChart,
    'common-chart':CommonChart
  },
  data() {
    return {
      // 加载层信息
      loading: [],
      loadingOptions:this.loadingOptions,
      //消费类型
      consumeTypeOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      queryParams:{
        groupField:'name',
        valueType: 'TIMES',
        commonRecordTypeId:undefined
      },
      //类型
      commonRecordTypeOptions:[],
      groupFieldOptions:[],
      nameOptions:[],
      //分析图表
      analyseChartData:{},
      timelineChartData:{},
      latestData:{},
      statData:{},
      predict: false,
      // 表单校验
      rules: {
        commonRecordTypeId: [
          { required: true, message: "类型不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    //加载查询条件和表单的
    this.getCommonRecordTypeTreeselect();
    this.getDictItemTree('COMMON_RECORD_ANALYSE_GROUP_FIELD',false).then(response => {
      this.groupFieldOptions = response;
    });
    let qb = getQueryObject(null);
    let commonRecordTypeId = qb.commonRecordTypeId;
    if(commonRecordTypeId!=null){
      this.queryParams.commonRecordTypeId = commonRecordTypeId;
      this.handleQuery();
    }
  },
  methods: {
    /** 搜索按钮操作 */
    handleQuery() {
      console.log('handleQuery')
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 查询信息 */
    getList() {
      if(this.queryParams.commonRecordTypeId==null||this.queryParams.commonRecordTypeId==undefined){
        this.msgError('请先选择记录类型');
      }else{
        this.analyseStat();
        this.timelineStat();
        this.getLatestData();
        this.getStatData();
      }
    },
    /** 查询类型下拉树结构 */
    getCommonRecordTypeTreeselect() {
      getCommonRecordTypeTree(false).then(response => {
        this.commonRecordTypeOptions = response;
      });
    },
    /** 查询类型下拉树结构 */
    getCommonRecordNameTreeselect() {
      let para ={
        commonRecordTypeId:this.queryParams.commonRecordTypeId
      }
      getNameTree(para).then(response => {
        this.nameOptions = response;
      });
    },
    /** 类型变化 */
    handleCommonRecordTypeChange(){
      this.getCommonRecordNameTreeselect();
    },
    /** 格式化预测值 */
    formatePredictValue(v,n) {
      return formatFloat(v,n);
    },
    /** 获取距今时间 */
    getTillNow(occurTime){
      let days = tillNowDays(null,occurTime);
      let ss = formatDays(0-days);
      if(days<-30){
        ss+='('+(0-days).toFixed(0)+'天)';
      }
      return ss;
    },
    /** 分析图表 */
    handleChartStat(valueType){
      this.queryParams.valueType = valueType;
      this.analyseStat();
    },
    /** 分析统计 */
    analyseStat(){
      this.openLoading();
      getCommonRecordAnalyse(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          response.height = '490px';
          this.analyseChartData = response;
          this.loading.close();
        }
      );
    },
    /** 时间线统计 */
    timelineStat(){
      let para = {
        commonRecordTypeId : this.queryParams.commonRecordTypeId,
        name : this.queryParams.name
      }
      getCommonRecordTimeline(this.addDateRange(para, this.dateRange)).then(
        response => {
          //组装chart数据
          response.height = '300px';
          response.chartType = 'MIX_LINE_BAR'
          this.timelineChartData = response;
        }
      );
    },
    /** 获取最新 */
    getLatestData(){
      let para = {
        commonRecordTypeId : this.queryParams.commonRecordTypeId,
        name : this.queryParams.name
      }
      getLatestCommonRecord(this.addDateRange(para, this.dateRange)).then(
        response => {
          this.latestData ={};
          if(response!=null){
            this.latestData = response;
          }
        }
      );
    },
    /** 获取统计 */
    getStatData(){
      let para = {
        commonRecordTypeId : this.queryParams.commonRecordTypeId,
        name : this.queryParams.name
      }
      statCommonRecord(this.addDateRange(para, this.dateRange)).then(
        response => {
          let days = 1;
          if(response!=null&&response.minDate!=null&&response.maxDate!=null){
            days = dateDiff(response.minDate,response.maxDate);
          }
          else{
            this.statData = {};
            return;
          }
          let perValue = response.totalValue*1.0/response.totalCount;
          let frequency = days / response.totalCount;
          this.statData ={
            daysStr: formatDays(days),
            totalCount: response.totalCount,
            totalValue: response.totalValue,
            perValue: perValue.toFixed(1),
            frequency: frequency.toFixed(1),
            unit:response.unit
          };

        }
      );
    },
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    }
  }
};
</script>
