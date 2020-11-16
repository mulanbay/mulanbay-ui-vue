<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="选择运动" prop="sportTypeId">
        <el-select
          v-model="queryParams.sportTypeId"
          placeholder="运动"
          clearable
          size="small"
          style="width: 240px"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in sportTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="锻炼日期">
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
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="dataList" >
      <el-table-column label="类别">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最大值" align="center">
        <template slot-scope="{row}">
          <span>{{ row.maxValue }}</span>
          <span class="link-type" @click="handleMultiSportExerciseInfo(row.groupType,'MAX')"><i class="el-icon-info" /></span>
        </template>
      </el-table-column>
      <el-table-column label="最小值" align="center">
        <template slot-scope="{row}">
          <span>{{ row.minValue }}</span>
          <span class="link-type" @click="handleMultiSportExerciseInfo(row.groupType,'MIN')"><i class="el-icon-info" /></span>
        </template>
      </el-table-column>
      <el-table-column label="平均值" align="center">
        <template slot-scope="{row}">
          <span>{{ row.avgValue }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 详情对话框 -->
    <el-dialog title="锻炼信息" :visible.sync="open" width="750px" append-to-body>
      <el-form ref="form" :model="form" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="运动类型" prop="sportTypeName">
               <el-input v-model="form.sportTypeName" placeholder="" :style="{width: '200px'}" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="锻炼时间" prop="exerciseDate">
              <el-date-picker type="datetime" v-model="form.exerciseDate" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                        :style="{width: '200px'}" placeholder="请选择时间" clearable >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="锻炼值" prop="kilometres">
             <el-input-number v-model="form.kilometres" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2" />
             <span>{{ sportTypeUnit }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="锻炼时长" prop="minutes">
             <el-input-number v-model="form.minutes" placeholder="单位:分钟" controls-position="right" :min="0" :controls="false" :precision="0" />
             分钟
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="平均配速" prop="pace">
             <el-input-number v-model="form.pace" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2" />
             分钟/公里
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最佳配速" prop="maxPace">
             <el-input-number v-model="form.maxPace" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2" />
             分钟/公里
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="平均速度" prop="speed">
             <el-input-number v-model="form.speed" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2" />
             公里/小时
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最佳速度" prop="maxSpeed">
             <el-input-number v-model="form.maxSpeed" placeholder="" controls-position="right" :min="0" :controls="false" :precision="2" />
             公里/小时
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="平均心率" prop="averageHeartRate">
             <el-input-number v-model="form.averageHeartRate" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
             次
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大心率" prop="maxHeartRate">
             <el-input-number v-model="form.maxHeartRate" placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" />
             次
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>

</div>
</template>

<script>
import {getSportTypeTree} from "@/api/sport/sportType";
import {getSportExerciseMultiStat,getSportExerciseByMultiStat} from "@/api/sport/sportExercise";

export default {
  name: "MultiStat",
  props: {
      //父层带过来的预算信息值
      sportTypeData: {
        id:undefined
      }
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 加载层信息
      loading: false,
      //运动类型
      sportTypeOptions:[],
      // 查询参数
      queryParams: {
        sportTypeId:undefined
      },
      dataList:[],
      //表单中的运动类型的单位
      sportTypeUnit:'',
      open:false,
      form:{}
    };
  },
  created() {
    //查询运动类型
    this.getSportTypeTreeselect();
    //获取父页面来的值
    if(this.sportTypeData){
      this.queryParams.sportTypeId = this.sportTypeData.id+'';
    }
    this.getList();
  },
  //监听父层带过来的账户信息值
  watch:{
    sportTypeData(newVal,oldVal){
      //需要重新查询账户树，否则显示不更新
      this.getSportTypeTreeselect();
      if(newVal){
        this.queryParams.sportTypeId = newVal.id+'';
      }
    }
  },
  methods: {
    /** 查询运动类型下拉树结构 */
    getSportTypeTreeselect() {
      getSportTypeTree(false).then(response => {
        this.sportTypeOptions = response;
      });
    },
    /** 查询详情 */
    handleMultiSportExerciseInfo(groupType,type){
      let para = {
        groupType:groupType,
        type:type,
        sportTypeId:this.queryParams.sportTypeId
      }
      getSportExerciseByMultiStat(para).then(response => {
        this.form = response;
        this.form.sportTypeName = response.sportType.name;
        this.sportTypeUnit = response.sportType.unit;
        this.open = true;
      });
    },
    // 打开加载层
    openLoading() {
      this.loading = true;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
    },
    getList() {
      this.loading=true;
      getSportExerciseMultiStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.dataList=new Array();
          let kmName = '锻炼值('+response.unit+')';
          let kilometresRow = {name:kmName,
          groupType:'KILOMETRES',
          maxValue:response.maxKilometres,
          minValue:response.minKilometres,
          avgValue:response.avgKilometres.toFixed(2)};
          this.dataList.push(kilometresRow);
          let minutesRow = {name:'锻炼时间(分钟)',
          groupType:'MINUTES',
          maxValue:response.maxMinutes,
          minValue:response.minMinutes,
          avgValue:response.avgMinutes.toFixed(2)};
          this.dataList.push(minutesRow);
          let speedRow = {name:'平均速度(公里/小时)',
          groupType:'SPEED',
          maxValue:response.maxSpeed,
          minValue:response.minSpeed,
          avgValue:response.avgSpeed.toFixed(2)};
          this.dataList.push(speedRow);
          let maxSpeedRow = {name:'最佳速度(公里/小时)',
          groupType:'MAXSPEED',
          maxValue:response.maxMaxSpeed,
          minValue:response.minMaxSpeed,
          avgValue:response.avgMaxSpeed.toFixed(2)};
          this.dataList.push(maxSpeedRow);
          let paceRow = {name:'平均配速(分钟/公里)',
          groupType:'PACE',
          maxValue:response.maxPace,
          minValue:response.minPace,
          avgValue:response.avgPace.toFixed(2)};
          this.dataList.push(paceRow);
          let maxPaceRow = {name:'最佳配速(分钟/公里)',
          groupType:'MAXPACE',
          maxValue:response.maxMaxPace,
          minValue:response.minMaxPace,
          avgValue:response.avgMaxPace.toFixed(2)};
          this.dataList.push(maxPaceRow);
          let maxHeartRateRow = {name:'最高心率(次/分钟)',
          groupType:'MAXHEARTRATE',
          maxValue:response.maxMaxHeartRate,
          minValue:response.minMaxHeartRate,
          avgValue:response.avgMaxHeartRate.toFixed(2)};
          this.dataList.push(maxHeartRateRow);
          let averageHeartRateRow = {name:'平均心率(次/分钟)',
          groupType:'AVERAGEHEART',
          maxValue:response.maxAverageHeartRate,
          minValue:response.minAverageHeartRate,
          avgValue:response.avgAverageHeartRate.toFixed(2)};
          this.dataList.push(averageHeartRateRow);
          this.loading=false;
        }
      );
    }
  }
};
</script>
