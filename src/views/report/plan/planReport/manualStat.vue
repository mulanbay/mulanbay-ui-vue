<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="150px">
      <el-form-item label="数据比对规则" prop="reStatCompareType">
        <el-radio-group v-model="dataSourceType">
          <el-radio label="P">指定计划</el-radio>
          <el-radio label="T">指定类型</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="dataSourceType == 'P'" label="选择计划" prop="userPlanId">
        <treeselect
         v-model="form.userPlanId"
         style="width: 240px"
         :options="userPlanOptions"
         :disable-branch-nodes="true"
         :show-count="true"
         :searchable="true"
         placeholder="请选择"
         />
      </el-form-item>
      <el-form-item v-if="dataSourceType == 'T'" label="选择类型" prop="userPlanId">
        <el-select v-model="form.planType" style="width: 240px" placeholder="请选择">
          <el-option
            v-for="dict in planTypeOptions"
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
      <el-form-item label="统计类型" prop="statType">
        <el-radio-group v-model="form.statType">
          <el-radio label="RE_STAT">重新统计</el-radio>
          <el-radio label="STAT_MISS">统计遗漏</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer" align="center">
      <el-button type="primary" @click="manualStat" v-hasPermi="['report:plan:planReport:manualStat']">统计数据</el-button>
      <el-button type="danger" @click="cleanData" v-hasPermi="['report:plan:planReport:cleanData']">删除数据</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script>
  import {manualStatPlanReport,cleanDataPlanReport} from "@/api/report/plan/planReport";
  import {getUserPlanTree} from "@/api/report/plan/userPlan";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "PlanReportManualStat",
  components: {
    Treeselect
  },
  data() {
    return {
      dataSourceType:'P',
      userPlanOptions:[],
      planTypeOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      form:{},
      rules:{
        userPlanId: [
          { required: true, message: "计划不能为空", trigger: "blur" }
        ],
        planType: [
          { required: true, message: "类型不能为空", trigger: "blur" }
        ],
        statType: [
          { required: true, message: "统计类型不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getUserPlanOptionsTreeselect();
    this.getEnumTree('PlanType','FIELD',false).then(response => {
      this.planTypeOptions = response;
    });
    this.reset();
  },
  watch: {
  },
  methods: {
    /** 查询搜索条件中的模板下拉树结构 */
    getUserPlanOptionsTreeselect() {
      getUserPlanTree(false,null,null).then(response => {
        this.userPlanOptions = response;
      });
    },
    //取消提醒
    cancel(){
      this.$emit('closeMe');
    },
    // 表单重置
    reset() {
      this.form = {
        statType:'RE_STAT'
      };
      this.resetForm("form");
    },
    //统计数据
    manualStat() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          manualStatPlanReport(this.addDateRange(this.form, this.dateRange)).then(response => {
            this.msgSuccess("执行成功");
            this.$emit('closeMe');
          });
        }
      });
    },
    //删除数据
    cleanData() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          cleanDataPlanReport(this.addDateRange(this.form, this.dateRange)).then(response => {
            this.msgSuccess("执行成功");
            this.$emit('closeMe');
          });
        }
      });
    }
  }
};
</script>
