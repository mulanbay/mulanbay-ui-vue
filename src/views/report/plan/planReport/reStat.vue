<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="150px">
      <el-form-item label="数据比对规则" prop="reStatCompareType">
        <el-radio-group v-model="form.reStatCompareType">
          <el-radio label="ORIGINAL">原始数据&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</el-radio>
          <el-radio label="ORIGINAL_LATEST">当年最新数据</el-radio>
          <el-radio label="LATEST">目前最新数据</el-radio>
          <el-radio label="SPECIFY">手动指定年份</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="form.reStatCompareType == 'SPECIFY'" label="数据参考年份" prop="year">
        <el-date-picker
          v-model="form.year"
          type="year"
          format="yyyy"
          value-format="yyyy"
          style="width: 180px"
          placeholder="选择年">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer" align="right">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </div>
</template>

<script>
  import {reStatPlanReport} from "@/api/report/plan/planReport";

export default {
  name: "PlanReportReStat",
  props: {
    planReportData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      form:{},
      rules:{
        reStatCompareType: [
          { required: true, message: "数据比对规则不能为空", trigger: "blur" }
        ],
        year: [
          { required: true, message: "年份不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.handleReceiveData(this.planReportData);
  },
  watch: {
    planReportData: {
      deep: true,
      handler(val) {
        this.planReportData =val;
        this.handleReceiveData(val);
      }
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.reset();
      this.form.ids = data.ids;
    },
    //取消提醒
    cancel(){
      this.$emit('closeMe');
    },
    // 表单重置
    reset() {
      this.form = {
        ids: undefined,
        reStatCompareType:"ORIGINAL",
        year:undefined
      };
      this.resetForm("form");
    },
    //保存提醒
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          reStatPlanReport(this.form).then(response => {
            this.msgSuccess("执行成功");
            this.$emit('closeMe');
          });
        }
      });
    }
  }
};
</script>
