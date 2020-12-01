<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="关键字" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用药日期">
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
      <el-form-item label="合并相同药名" prop="mergeSameName">
        <el-switch v-model="queryParams.mergeSameName"  @change="handleQuery"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['health:treat:treatDrugDetail:stat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="statList">
      <el-table-column label="ID" prop="id" v-if="false==queryParams.mergeSameName" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="药品名" min-width="160px"  :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="看病时间" v-if="false==queryParams.mergeSameName"  align="center" width="120px">
        <template slot-scope="{row}">
          <span>{{ row.treatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总次数" align="center">
        <template slot-scope="{row}">
          <span>{{ row.totalCount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用药天数" align="center">
        <template slot-scope="{row}">
          <span>{{ row.days }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用药周数" align="center">
        <template slot-scope="{row}">
          <span>{{ formatStar(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="第一次用药时间" align="center" width="160px">
        <template slot-scope="{row}">
          <span>{{ row.minTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后一次用药时间" align="center" width="160px">
        <template slot-scope="{row}">
          <span>{{ row.maxTime }}</span>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import {getTreatDrugDetailStat} from "@/api/health/treat/treatDrugDetail";

export default {
  name: "Stat",
  props: {
    //父层带过来的信息值
    treatData: {
      startDate: undefined,
      endDate:undefined
    }
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 列表数据
      statList:[],
      commonStatusOptions:this.commonStatusOptions,
      // 查询参数
      queryParams: {
        page:0,
        name: undefined,
        mergeSameName: true
      }
    };
  },
  created() {
    this.handleReceiveData(this.treatData);
    this.getList();
  },
  //监听父层带过来的账户信息值
  watch:{
    treatData(newVal,oldVal){
      this.handleReceiveData(newVal);
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      if(data!=null&&data.startDate!=null){
        this.dateRange=[data.startDate,data.endDate];
      }
    },
    /** 用药周数 */
    formatStar(row) {
      let weeks = Math.round(row.days/7);
      return weeks;
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      getTreatDrugDetailStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.statList = response;
          this.loading = false;
        }
      );
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams ={
        page:0,
        name: undefined,
        mergeSameName: false
      };
      this.handleQuery();
    }
  }
};
</script>
