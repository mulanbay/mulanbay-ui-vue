<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
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
      <el-form-item label="同步执行" prop="statable">
        <el-switch
          v-model="form.sync">
        </el-switch>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer" align="center">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>

  </div>
</template>

<script>
import {reSaveUserScore} from "@/api/data/userScore";

export default {
  name: "ReSave",
  data() {
    return {
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        sync: [
          { required: true, message: "是否同步不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {

  },
  methods: {
    // 表单重置
    reset() {
      this.form = {
        sync : false
      };
      this.resetForm("form");
    },
    // 取消按钮
    cancel() {
      //调用父组件的方法来关闭子组件
      this.$emit('closeMe');
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          reSaveUserScore(this.addDateRange(this.form, this.dateRange)).then(response => {
            this.msgSuccess("重新统计成功");
          });
          this.$emit('closeMe');
        }
      });
    }
  }
};
</script>
