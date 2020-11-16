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
      <el-form-item label="报告日期">
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
      <el-form-item label="数据参考年份" prop="year">
        <el-date-picker
          v-model="queryParams.year"
          type="year"
          format="yyyy"
          value-format="yyyy"
          style="width: 180px"
          placeholder="选择年">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="计划类型" prop="planType">
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
      <el-form-item label="过滤全零数据" prop="minValue">
        <el-switch v-model="queryParams.minValue" active-value="0" inactive-value="null" ></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['report:plan:planReport:avgStat']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
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
      <el-table-column label="标题" align="center" width="160" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ formatName(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="次数平均值" align="center" :show-overflow-tooltip="true" >
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
      <el-table-column label="值的平均值" align="center" :show-overflow-tooltip="true">
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
          <span v-if="row.userPlanConfigValue.year==row.year">
           <span>{{ row.userPlanConfigValue.planCountValue +'次' }}</span>
          </span>
          <span v-else>
           <span style="color:red">{{ row.userPlanConfigValue.planCountValue+'次('+row.userPlanConfigValue.year+')' }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="计划值" align="center">
        <template slot-scope="{row}">
          <span v-if="row.userPlanConfigValue.year==row.year">
           <span>{{ row.userPlanConfigValue.planValue+row.userPlan.unit }}</span>
          </span>
          <span v-else>
           <span style="color:red">{{ row.userPlanConfigValue.planValue +row.userPlan.unit +'('+row.userPlanConfigValue.year+')'}}</span>
          </span>
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

  </div>
</template>

<script>
  import {getPlanReportAvgStat} from "@/api/report/plan/planReport";
  import {getUserPlanTree} from "@/api/report/plan/userPlan";
  import {deepClone} from "@/utils/index";
  import {getYear} from "@/utils/datetime";
  import {getValueCompareResult,getCompareYearString} from "@/utils/planUtils";

  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "AvgStat",
  components: {
    Treeselect
  },
  data() {
    return {
      // 遮罩层
      loading: true,
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
        minValue: null,
        year:getYear(-1)+'',
        planType:'MONTH'
      },
      //用户计划
      userPlanOptions:[],
      planTypeOptions:[],
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
    this.getList();
    this.getUserPlanOptionsTreeselect();
    this.getEnumTree('PlanType','FIELD',false).then(response => {
      this.planTypeOptions = response;
    });
  },
  methods: {
    /** 格式化名称，计算各数值 */
    formatName(row){
      //完成值与进度
      let countResult = getValueCompareResult(row.reportCountValue.toFixed(1),row.userPlanConfigValue.planCountValue,row.userPlan.planConfig.compareType,'次');
      row.cf = countResult.finished;
      row.cv = countResult.valueStr;
      let valueResult = getValueCompareResult(row.reportValue.toFixed(1),row.userPlanConfigValue.planValue,row.userPlan.planConfig.compareType,row.userPlan.unit);
      row.vf = valueResult.finished;
      row.vv = valueResult.valueStr;
      return row.userPlan ==null ? '--' : row.userPlan.title;
    },
    /** 查询搜索条件中的模板下拉树结构 */
    getUserPlanOptionsTreeselect() {
      getUserPlanTree(false,null,null).then(response => {
        this.userPlanOptions = response;
      });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      let qp = this.addDateRange(this.queryParams, this.dateRange);
      let acQueryParams = deepClone(qp);
      if(acQueryParams.countValueStatResults!=null){
        acQueryParams.countValueStatResults = acQueryParams.countValueStatResults.join(',');
      }
      if(acQueryParams.valueStatResults!=null){
        acQueryParams.valueStatResults = acQueryParams.valueStatResults.join(',');
      }
      if(acQueryParams.minValue=='null'){
        acQueryParams.minValue=undefined;
      }
      getPlanReportAvgStat(acQueryParams).then(
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
    },
    /** 关闭表单编辑操作 */
    closeTreatRecordDetail(){
      this.treatRecordDetailVisible = false;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids.join(",");
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deletePlanReport(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {}
      );
    }
  }
};
</script>
