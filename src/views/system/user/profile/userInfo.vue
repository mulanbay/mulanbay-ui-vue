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
      <el-form-item label="邮件发送" prop="sendEmail">
        <el-switch v-model="user.sendEmail"></el-switch>
        <span class="link-type" @click="msgAlert('提示','消息将发送到您绑定的邮箱')"><i class="el-icon-question" /></span>
      </el-form-item>
      <el-form-item label="微信发送" prop="sendWxMessage">
        <el-switch v-model="user.sendWxMessage"></el-switch>
        <span class="link-type" @click="msgAlert('提示','消息将以微信公众号来发送，请先关注公众号')"><i class="el-icon-question" /></span>
      </el-form-item>
      <el-form-item label="常驻城市" prop="residentCity">
        <el-input v-model="user.residentCity" maxlength="50" />
      </el-form-item>
      <el-form-item label="二次授权" prop="secAuthType">
        <el-select
          v-model="user.secAuthType"
          placeholder="授权"
          clearable
          collapse-tags
          size="small"
          style="width: 200px"
        >
          <el-option
            v-for="dict in secAuthTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <span class="link-type" @click="msgAlert('提示','一些敏感功能需要二次认证时使用')"><i class="el-icon-question" /></span>
      </el-form-item>
    <el-form-item label="评分模板" prop="scoreGroup">
      <el-select
        v-model="user.scoreGroup"
        placeholder="评分模板"
        clearable
        collapse-tags
        size="small"
        style="width: 200px"
      >
        <el-option
          v-for="dict in scoreGroupOptions"
          :key="dict.id"
          :label="dict.text"
          :value="dict.id"
        />
      </el-select>
      <span class="link-type" @click="msgAlert('提示','不同的模板采用不同的评测标准')"><i class="el-icon-question" /></span>
      <el-button size="mini" type="text" @click="handleSelfJudge"
        v-hasPermi="['data:userScore:selfJudge']">
        评测
      </el-button>
    </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="submit">保存</el-button>
        <el-button type="danger" size="mini" @click="close">关闭</el-button>
      </el-form-item>
    </el-form>

    <!-- 积分评定 -->
    <el-dialog :title="scoreJudgeTitle" width="720px" :visible.sync="scoreJudgeOpen"  append-to-body>
      <el-form :inline="true">
        <el-form-item label="积分模板">
         <el-select
           v-model="groupCode"
           @change="scoreSelfJudge"
           placeholder="积分模板"
           collapse-tags
           size="small"
           style="width: 140px"
         >
           <el-option
             v-for="dict in scoreGroupOptions"
             :key="dict.id"
             :label="dict.text"
             :value="dict.id"
           />
         </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="query"
            icon="el-icon-search"
            size="mini"
            v-hasPermi="['data:userScore:selfJudge']"
            @click="scoreSelfJudge" >
            评定
          </el-button>
        </el-form-item>
      </el-form>
      <score-detail v-loading="loading"  :userScoreData="userScoreData"/>
    </el-dialog>

  </div>
</template>

<script>
import { editProfile } from "@/api/auth/user";
import {userScoreSelfJudge} from "@/api/data/userScore";
import {getScoreConfigGroupTree} from "@/api/config/scoreConfigGroup";
import ScoreDetail from '../../../data/userScore/detail'

export default {
  components: {
    'score-detail':ScoreDetail
  },
  props: {
    user: {
      type: Object
    }
  },
  data() {
    return {
      //积分评测 start
      scoreJudgeTitle:'',
      scoreJudgeOpen:false,
      groupCode:undefined,
      userScoreData:{list:[]},
      loading:false,
      //积分评测 end

      secAuthTypeOptions:[],
      scoreGroupOptions:[],
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
        birthday: [
          { required: true, message: "生日不能为空", trigger: "blur" }
        ],
        secAuthType: [
          { required: true, message: "二次授权不能为空", trigger: "blur" }
        ],
        scoreGroup: [
          { required: true, message: "评分模板不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getEnumTree('AuthType','FIELD',false).then(response => {
      this.secAuthTypeOptions = response;
    });
    getScoreConfigGroupTree('code',false).then(response => {
      this.scoreGroupOptions = response;
    });
  },
  methods: {
    //评分系统自我评测
    handleSelfJudge(){
      this.scoreJudgeTitle = '评分自测';
      this.scoreJudgeOpen = true;
    },
    scoreSelfJudge(){
      let para ={
        groupCode:this.groupCode
      };
      this.loading = true;
      userScoreSelfJudge(para).then(
        response => {
          let totalScore=0;
          let totalMaxScore=0;
          let dataList = new Array();
          for (let i = 0; i < response.length; i++) {
            let row = {
              id:i+1,
              name:response[i].name,
              score:response[i].score,
              maxScore:response[i].maxScore,
              statValue:response[i].statValue,
              limitValue:response[i].limitValue,
              remark:response[i].remark
            };
            dataList.push(row);
            totalScore+=response[i].score;
            totalMaxScore+=response[i].maxScore;
          }
          let row = {
            id:'',
            name:'总分',
            score:totalScore,
            maxScore:totalMaxScore,
            statValue:'',
            limitValue:'',
            remark:''
          };
          dataList.push(row);
          this.userScoreData.list = dataList;
          this.loading = false;
        }
      );
    },
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
