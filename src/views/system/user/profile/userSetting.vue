<template>
  <div class="app-container">

    <el-form ref="form" :model="user" :rules="rules" label-width="120px">
      <el-form-item label="消息(邮件发送)" prop="sendEmail">
        <el-switch v-model="user.sendEmail"></el-switch>
        <span class="link-type" @click="msgAlert('提示','消息将发送到您绑定的邮箱')"><i class="el-icon-question" /></span>
      </el-form-item>
      <el-form-item label="消息(微信发送)" prop="sendWxMessage">
        <el-switch v-model="user.sendWxMessage"></el-switch>
        <span class="link-type" @click="msgAlert('提示','消息将以微信公众号来发送，请先关注公众号')"><i class="el-icon-question" /></span>
      </el-form-item>
      <el-form-item label="看病商品类型" prop="treatGoodsTypeId">
        <!--普通的el-option会导致显示问题-->
        <treeselect v-model="form.treatGoodsTypeId" :options="goodsTypeOptions"  @input="getSubGoodsTypeTreeselect" :disable-branch-nodes="false" :show-count="true" placeholder="请选择商品类型" />
      </el-form-item>
      <el-form-item label="看病商品子类" prop="treatGoodsTypeId">
        <!--普通的el-option会导致显示问题-->
        <treeselect v-model="form.treatSubGoodsTypeId" :options="subGoodsTypeOptions" :disable-branch-nodes="false" :show-count="true" placeholder="请选择商品子类" />
      </el-form-item>
      <el-form-item label="看病购买来源" prop="treatBuyTypeId">
        <treeselect v-model="form.treatBuyTypeId" :options="buyTypeOptions" :disable-branch-nodes="false" :show-count="true" placeholder="请选择购买来源" />
      </el-form-item>
      <el-form-item label="默认购买来源" prop="buyTypeId">
        <treeselect v-model="form.buyTypeId" :options="buyTypeOptions" :disable-branch-nodes="false" :show-count="true" placeholder="请选择购买来源" />
      </el-form-item>
      <el-form-item label="默认支付方式">
        <el-select v-model="form.payment" :style="{width: '100%'}" placeholder="请选择">
          <el-option
            v-for="dict in paymentOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="我的常驻城市" prop="residentCity">
        <el-input v-model="form.residentCity" maxlength="50" />
      </el-form-item>
      <el-form-item label="用户评分模板" prop="scoreGroup">
        <el-select
          v-model="form.scoreGroup"
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
        <el-button type="success" size="mini" @click="loadUserSetting()">重新加载</el-button>
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
  import { getUserSetting,editUserSetting } from "@/api/auth/userSetting";
  import {userScoreSelfJudge} from "@/api/data/userScore";
  import {getScoreConfigGroupTree} from "@/api/config/scoreConfigGroup";
  import {getGoodsTypeTree} from "@/api/consume/goodsType";
  import {getBuyTypeTree} from "@/api/consume/buyType";
  import ScoreDetail from '../../../data/userScore/detail'
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  components: {
    Treeselect,
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
      form:{},
      loading:false,
      //积分评测 end
      scoreGroupOptions:[],
      //商品类型(搜索和表单是同一个)
      goodsTypeOptions:[],
      //购买来源
      buyTypeOptions:[],
      //表单的商品子类型
      subGoodsTypeOptions:[],
      paymentOptions:[],
      // 表单校验
      rules: {
        scoreGroup: [
          { required: true, message: "评分模板不能为空", trigger: "blur" }
        ],
        sendEmail: [
          { required: true, message: "请选择是否发送邮件", trigger: "blur" }
        ],
        sendWxMessage: [
          { required: true, message: "请选择是否发送微信", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    getScoreConfigGroupTree('code',false).then(response => {
      this.scoreGroupOptions = response;
    });
    this.getEnumTree('Payment','FIELD',false).then(response => {
      this.paymentOptions = response;
    });
    //加载查询条件和表单的
    this.getGoodsTypeTreeselect();
    this.getBuyTypeTreeselect();
    this.loadUserSetting();
  },
  methods: {
    /** 查询搜索条件中的商品大类下拉树结构 */
    getGoodsTypeTreeselect() {
      getGoodsTypeTree(0,'COMMON',false).then(response => {
        this.goodsTypeOptions = response;
      });
    },
    /** 查询搜索条件中的购买来源下拉树结构 */
    getBuyTypeTreeselect() {
      getBuyTypeTree(0,false).then(response => {
        this.buyTypeOptions = response;
      });
    },
    /** 查询表单中的商品子类下拉树结构 */
    getSubGoodsTypeTreeselect(pid) {
      //this.form.treatSubGoodsTypeId = undefined;
      if(pid===undefined||pid===null||pid===''){
        this.subGoodsTypeOptions = [];
      }else{
        getGoodsTypeTree(pid,'COMMON',false).then(response => {
          this.subGoodsTypeOptions = response;
        });
      }
    },
    /** 评分系统自我评测 */
    handleSelfJudge(){
      this.scoreJudgeTitle = '评分自测';
      this.scoreJudgeOpen = true;
    },
    /** 评分系统自我评测 */
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
    /** 表单重置 */
    reset() {
      this.form = {
        id: undefined,
        sendEmail: false,
        sendWxMessage: false,
        scoreGroup: undefined,
        residentCity:undefined,
        treatGoodsTypeId:undefined,
        treatSubGoodsTypeId:undefined,
        treatBuyTypeId:undefined,
        payment:undefined,
        buyTypeId:undefined
      };
      this.resetForm("form");
    },
    /** 加载用户设置 */
    loadUserSetting(row) {
      this.reset();
      getUserSetting().then(response => {
        this.form = response;
      });
    },
    /** 提交表单 */
    submit() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          editUserSetting(this.form).then(response => {
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
