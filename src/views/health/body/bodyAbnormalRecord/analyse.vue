<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item v-if="queryParams.tags !=null" label="疾病标签" prop="tags">
        <el-input v-model="queryParams.tags" style="width: 240px" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
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
      <el-form-item label="统计分组" prop="groupField">
        <el-select
          v-model="queryParams.groupField"
          placeholder="统计分组"
          clearable
          size="small"
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
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['health:body:bodyAbnormalRecord:analyse']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--列表数据-->
    <el-table v-loading="loading" :data="dataList" :max-height="tableHeight">
      <el-table-column label="ID" prop="id" fixed="left" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称"  fixed="left" min-width="120px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ formatName(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计" align="center">
        <el-table-column label="发生总次数" align="center" width="60">
          <template slot-scope="{row}">
            <span>{{ row.totalCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="持续总天数" align="center" width="60">
          <template slot-scope="{row}">
            <span>{{ row.totalLastDays }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="疾病时间" align="center">
        <el-table-column label="最早一次发生时间" align="center" width="110">
          <template slot-scope="{row}">
            <span>{{ row.minOccurDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最近一次发生时间" align="center" width="110">
          <template slot-scope="{row}">
            <span>{{ row.maxOccurDate }}</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="最近一次看病信息" align="center">
        <el-table-column label="最近一次看病时间" align="center" width="180">
          <template slot-scope="{row}">
            <span v-if="row.treatRecordStat.maxTreatDate != null">
             <span style="color:purple">{{ row.treatRecordStat.maxTreatDate }}</span>
             <span class="link-type" @click="showTreatRecord(row.treatRecordStat.maxTreatRecord.id)"><i class="el-icon-s-promotion" /></span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="距离最近一次看病" align="center" :show-overflow-tooltip="true">
          <template slot-scope="{row}">
            <span v-if="row.maxDays<0">
             <span style="color:red">--</span>
            </span>
            <span v-else-if="row.maxDays>=180">
             <span style="color:red">{{ row.maxDaysStr }}</span>
            </span>
            <span v-else-if="row.maxDays>=90">
             <span style="color:#c71585">{{ row.maxDaysStr }}</span>
            </span>
            <span v-else-if="row.maxDays>=30">
             <span style="color:purple">{{ row.maxDaysStr }}</span>
            </span>
            <span v-else-if="row.maxDays>=10">
             <span style="color:green">{{ row.maxDaysStr }}</span>
            </span>
            <span v-else>{{ row.maxDays }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最近一次看病确诊疾病" align="center" width="110">
          <template slot-scope="{row}">
            <span v-if="row.treatRecordStat.maxTreatRecord!=null">
             <span>{{ row.treatRecordStat.maxTreatRecord.diagnosedDisease }}</span>
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="最近一次看病是否有病" align="center"  width="110">
          <template slot-scope="{row}">
            <span v-if="row.treatRecordStat.maxTreatRecord!=null">
             <el-switch v-model="row.treatRecordStat.maxTreatRecord.isSick" disabled=""></el-switch>
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="最早一次看病信息" align="center">
        <el-table-column label="最早一次看病时间" align="center" width="180">
          <template slot-scope="{row}">
            <span v-if="row.treatRecordStat.minTreatDate != null">
             <span style="color:purple">{{ row.treatRecordStat.minTreatDate }}</span>
             <span class="link-type" @click="showTreatRecord(row.treatRecordStat.minTreatRecord.id)"><i class="el-icon-s-promotion" /></span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="距离最早一次看病" align="center"  :show-overflow-tooltip="true">
          <template slot-scope="{row}">
            <span v-if="row.minDays<0">
             <span style="color:red">--</span>
            </span>
            <span v-else-if="row.minDays>=180">
             <span style="color:red">{{ row.minDaysStr }}</span>
            </span>
            <span v-else-if="row.minDays>=90">
             <span style="color:#c71585">{{ row.minDaysStr }}</span>
            </span>
            <span v-else-if="row.minDays>=30">
             <span style="color:purple">{{ row.minDaysStr }}</span>
            </span>
            <span v-else-if="row.minDays>=10">
             <span style="color:green">{{ row.minDaysStr }}</span>
            </span>
            <span v-else>{{ row.minDays }}</span>
          </template>
        </el-table-column>
        <el-table-column label="最早一次看病确诊疾病" align="center" width="110">
          <template slot-scope="{row}">
            <span v-if="row.treatRecordStat.minTreatRecord!=null">
             <span>{{ row.treatRecordStat.minTreatRecord.diagnosedDisease }}</span>
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="最早一次看病是否有病" align="center" width="110">
          <template slot-scope="{row}">
            <span v-if="row.treatRecordStat.minTreatRecord!=null">
             <el-switch v-model="row.treatRecordStat.minTreatRecord.isSick" disabled=""></el-switch>
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="身体信息" align="center">
        <el-table-column label="平均体重(KG)" align="center">
          <template slot-scope="{row}">
            <span>{{ row.avgWeight==null ? '--':row.avgWeight.toFixed(1) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="平均身高(cm)" align="center">
          <template slot-scope="{row}">
            <span>{{ row.avgHeight==null ? '--':row.avgHeight.toFixed(1) }}</span>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import {getBodyAbnormalRecordAnalyse} from "@/api/health/body/bodyAbnormalRecord";
import {copyObject,getQueryObject} from "@/utils/index";
import {dateDiff,formatDays} from "@/utils/datetime";

export default {
  name: "BodyAbnormalRecordAnalyse",
  data() {
    return {
      //表格高度，固定表头使用
      tableHeight:document.body.clientHeight - 180,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 列表数据
      dataList:[],
      groupFieldOptions:[
        {
          id: 'ORGAN',
          text: '器官'
        },
        {
          id: 'DISEASE',
          text: '疾病症状'
        }
      ],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        name: undefined,
        groupField:'ORGAN',
        chartType:'PIE'
      },
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0)
    };
  },
  created() {
    let qb = getQueryObject(null);
    if(!this.isObjectEmpty(qb.name)){
      this.queryParams.name = qb.name;
    }
    if(!this.isObjectEmpty(qb.groupField)){
      this.queryParams.groupField = qb.groupField;
    }
    this.getList();
  },
  methods: {
    /** 格式化名称 */
    formatName(row){
      //先计算出days供下面的方法使用
      if(row.treatRecordStat.maxTreatDate==null){
        row.maxDays=-1;
      }else{
        const maxDays = dateDiff(row.treatRecordStat.maxTreatDate,row.maxOccurDate);
        const maxDaysStr = formatDays(maxDays);
        row.maxDays=maxDays;
        row.maxDaysStr=maxDaysStr;
      }
      if(row.treatRecordStat.minTreatDate==null){
        row.minDays=-1;
      }else{
        const minDays = dateDiff(row.treatRecordStat.minTreatDate,row.maxOccurDate);
        const minDaysStr = formatDays(minDays);
        row.minDays=minDays;
        row.minDaysStr=minDaysStr;
      }
      return row.name;
    },
    /** 查看看病记录 */
    showTreatRecord(id){
      //路由跳转
      this.$router.push({name:'TreatRecord',query: {id:id}})
    },
    /** 关闭表单编辑操作 */
    closeTreatRecordDetail(){
      this.treatRecordDetailVisible = false;
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      getBodyAbnormalRecordAnalyse(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.dataList = response.rows;
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
    }
  }
};
</script>
