<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="分组类型" prop="groupField">
        <el-select
          v-model="queryParams.groupField"
          placeholder="分组"
          clearable
          size="small"
          style="width: 100px"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in groupFieldOptions"
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
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['health:treat:treatOperation:stat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="dataList" :row-class-name="tableRowClassName">
      <el-table-column label="手术名称" fixed="left"  width="190" :show-overflow-tooltip="true">
        <template slot-scope="{row}" >
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="次数" align="center" width="60">
        <template slot-scope="{row}">
          <span>{{ row.totalCount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="花费" align="center" width="110">
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.totalFee) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最早时间" align="center" width="110">
        <template slot-scope="{row}">
          <span>{{ row.minDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最晚时间" align="center" width="110">
        <template slot-scope="{row}">
          <span>{{ row.maxDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时长" align="center" width="110" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.daysDesc }}</span>
        </template>
      </el-table-column>
      <el-table-column label="频率" align="center" width="110">
        <template slot-scope="{row}">
          <span>
            <el-tag :type="row.type">{{ row.frequence }}</el-tag>
          </span>
        </template>
      </el-table-column>
    </el-table>

</div>
</template>

<script>
import {getTreatOperationStat} from "@/api/health/treat/treatOperation";
import {formatDays,dateDiff} from "@/utils/datetime";

export default {
  name: "TreatOperationStat",
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
      //分组类型
      groupFieldOptions:[
        {
          id: 'name',
          text: '名称'
        },
        {
          id: 'category',
          text: '分类'
        }
      ],
      // 查询参数
      queryParams: {
        groupField:'name'
      },
      dataList:[]
    };
  },
  created() {
    this.getList();
  },
  methods: {
    tableRowClassName({row, rowIndex}) {
      if(row.sum==true){
        return 'sum-row';
      }else{
        return ''
      }
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
      getTreatOperationStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.dataList=new Array();
          const n = response.length;
          for (var i = 0; i < n; i++) {
            let name = response[i].name==null ? '未知':response[i].name;
            let sum =false;
            let daysDesc ='';
            let frequence ='';
            let type='';
            if(i==n-1){
              sum=true;
            }else{
              let days = dateDiff(response[i].minDate,response[i].maxDate);
              daysDesc = formatDays(days);
              frequence = days / 365 /response[i].totalCount ;
              if(frequence<1/(12*30)){
                frequence = (days/response[i].totalCount).toFixed(1)+'天/次';
                type= 'danger';
              }else if(frequence<1){
                frequence = (frequence*12).toFixed(1)+'月/次';
                type= '';
              }else{
                frequence = frequence.toFixed(1)+'年/次'
                type= 'success';
              }
            }
            let row = {
                name:name,
                totalCount:response[i].totalCount,
                totalFee:response[i].totalFee,
                sum:sum,
                minDate:response[i].minDate,
                maxDate:response[i].maxDate,
                daysDesc:daysDesc,
                frequence:frequence,
                type:type
            };
            this.dataList.push(row);
          }
          this.loading=false;
        }
      );
    }
  }
};
</script>
<style>
  .el-table .sum-row {
    background: #f0f9eb;
  }
</style>
