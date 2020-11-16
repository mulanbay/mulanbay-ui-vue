<template>
  <div class="app-container">

      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>

  </div>
</template>

<script>
  import {createAccountSnapshotInfo} from "@/api/fund/account";

export default {
  name: "Detail",
  props: {
      dialog_visible: Boolean
  },
  data() {
    return {
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
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
        id: undefined,
        name: undefined,
        remark: undefined
      };
      this.resetForm("form");
    },
    // 取消按钮
    cancel() {
      //调用父组件的方法来关闭子组件
      this.$emit('closeMe');
    },
    /** 新增按钮操作 */
    handleCreate() {
      this.reset();
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids.join(",")
      getAccount(id).then(response => {
        this.form = response;
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            createAccountSnapshotInfo(this.form).then(response => {
              this.msgSuccess("修改成功");
            });
          } else {
            createAccountSnapshotInfo(this.form).then(response => {
              this.msgSuccess("新增成功");
            });
          }
          this.$emit('closeMe');
        }
      });
    }
  }
};
</script>
