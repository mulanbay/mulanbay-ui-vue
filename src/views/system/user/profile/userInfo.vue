<template>
  <div class="app-container">

    <el-form ref="form" :model="user" :rules="rules" label-width="80px">
      <el-form-item label="用户昵称" prop="nickname">
        <el-input v-model="user.nickname" />
      </el-form-item>
      <el-form-item label="手机号码" prop="phone">
        <el-input v-model="user.phone" maxlength="11" />
      </el-form-item>
      <el-form-item label="用户邮箱" prop="email">
        <el-input v-model="user.email" maxlength="50" />
      </el-form-item>
      <el-form-item label="我的生日" prop="birthday">
        <el-date-picker type="date" v-model="user.birthday" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
          :style="{width: '200px'}" placeholder="请选择日期" clearable >
        </el-date-picker>
        <span class="link-type" @click="msgAlert('提示','锻炼管理中：计算最大心率使用')"><i class="el-icon-question" /></span>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="submit">保存</el-button>
        <el-button type="danger" size="mini" @click="close">关闭</el-button>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
  import { editProfile } from "@/api/auth/user";

export default {
  props: {
    user: {
      type: Object
    }
  },
  data() {
    return {
      loading:false,
      //积分评测 end
      secAuthTypeOptions:[],
      // 表单校验
      rules: {
        nickname: [
          { required: true, message: "用户昵称不能为空", trigger: "blur" }
        ],
        email: [
          { required: true, message: "邮箱地址不能为空", trigger: "blur" },
          {
            type: "email",
            message: "'请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ],
        phone: [
          { required: true, message: "手机号码不能为空", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }
        ],
        birthday: [
          { required: true, message: "生日不能为空", trigger: "blur" }
        ],
        secAuthType: [
          { required: true, message: "二次授权不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getEnumTree('AuthType','FIELD',false).then(response => {
      this.secAuthTypeOptions = response;
    });
  },
  methods: {
    //统计表单
    submit() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          editProfile(this.user).then(response => {
            this.msgSuccess("修改成功");
          });
        }
      });
    },
    close() {
      this.$store.dispatch("tagsView/delView", this.$route);
      this.$router.push({ path: "/index" });
    }
  }
};
</script>
