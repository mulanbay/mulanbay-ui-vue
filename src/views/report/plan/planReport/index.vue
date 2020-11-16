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
      <el-form-item v-if="moreCdn==true" label="排序方式" prop="sortField">
        <el-select
          v-model="queryParams.sortField"
          placeholder="字段"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in sortFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.sortType"
          placeholder="方式"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in sortTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
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
      <el-form-item v-if="moreCdn==true" label="统计类型" prop="countValueStatResults">
        <el-select
          v-model="queryParams.countValueStatResults"
          style="width: 120px"
          clearable
          multiple
          placeholder="次数">
          <el-option
            v-for="dict in statResultsOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.valueStatResults"
          style="width: 120px"
          clearable
          multiple
          placeholder="值">
          <el-option
            v-for="dict in statResultsOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="过滤全零数据" prop="minValue">
        <el-switch v-model="queryParams.minValue" active-value="0" inactive-value="null" ></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['report:plan:planReport:query']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['report:plan:planReport:delete']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          :disabled="multiple"
          @click="handleReStat"
          v-hasPermi="['report:plan:planReport:reStat']"
        >重新统计</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="stat"
          icon="el-icon-s-data"
          size="mini"
          @click="handleManualStat"
          v-hasPermi="['report:plan:planReport:manualStat']"
        >手动统计</el-button>
      </el-col>
    </el-row>

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
      <el-table-column label="统计日期" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.bussStatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计时间" align="center" width="180">
        <template slot-scope="{row}">
          <span>{{ row.createdTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="80" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['report:plan:planReport:delete']"
          >删除</el-button>
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

    <!-- 重新统计页面 -->
    <el-dialog :title="reStatTitle" width="580px" :visible.sync="reStatVisible" append-to-body>
      <re-stat
        :planReportData="planReportData"
        @closeMe="closeReStat"
      />
    </el-dialog>

    <!-- 手动统计页面 -->
    <el-dialog :title="manualStatTitle" width="580px" :visible.sync="manualStatVisible" append-to-body>
      <manual-stat @closeMe="closeManualStat"/>
    </el-dialog>

  </div>
</template>

<script>
  import {fetchList,deletePlanReport} from "@/api/report/plan/planReport";
  import {getUserPlanTree} from "@/api/report/plan/userPlan";
  import {deepClone} from "@/utils/index";
  import {getValueCompareResult,getCompareYearString} from "@/utils/planUtils";

  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";

  import ReStat from './reStat'
  import ManualStat from './manualStat'

export default {
  name: "PlanReport",
  components: {
    Treeselect,
    're-stat':ReStat,
    'manual-stat':ManualStat
  },
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      //重新统计配置
      reStatTitle:'',
      reStatVisible:false,
      planReportData:{
        ids:undefined
      },
      //手动统计配置
      manualStatTitle:'',
      manualStatVisible:false,
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
        sortField:'bussStatDate',
        sortType:'desc'
      },
      booleanOptions:this.booleanOptions,
      //用户计划
      userPlanOptions:[],
      sortFieldOptions:[],
      sortTypeOptions:[],
      planTypeOptions:[],
      statResultsOptions:[],
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
    //排序字段
    this.getDictItemTree('PLAN_REPORT_SORD_FIELD',false).then(response => {
      this.sortFieldOptions = response;
    });
    //排序方式
    this.getDictItemTree('SORT_TYPE',false).then(response => {
      this.sortTypeOptions = response;
    });
    this.getList();
    this.getUserPlanOptionsTreeselect();
    this.getEnumTree('PlanType','FIELD',false).then(response => {
      this.planTypeOptions = response;
    });
    this.getEnumTree('PlanStatResultType','FIELD',false).then(response => {
      this.statResultsOptions = response;
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
    /** 查询搜索条件中的模板下拉树结构 */
    getUserPlanOptionsTreeselect() {
      getUserPlanTree(false,null,null).then(response => {
        this.userPlanOptions = response;
      });
    },
    /** 重新统计 */
    handleReStat(){
      const ids = this.ids.join(",");
      this.reStatTitle='重新统计,ID编号:'+ids;
      this.reStatVisible=true;
      this.planReportData = Object.assign({}, this.planReportData, {
        ids: ids
      });
      //取消选择
    },
    closeReStat(){
      this.reStatVisible=false;
    },
    /** 手动统计 */
    handleManualStat(){
      this.manualStatTitle='手动统计';
      this.manualStatVisible =true;
    },
    closeManualStat(){
      this.manualStatVisible =false;
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
      fetchList(acQueryParams).then(
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
