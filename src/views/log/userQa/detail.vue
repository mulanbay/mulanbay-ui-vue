<template>
  <div class="app-container">
    <el-row>

      <el-col :span="12" class="card-box">
        <el-card>
          <div slot="header">
            <span>QA详情</span>
          </div>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <tbody>
                <tr>
                  <td style="width: 80px;"><div class="cell">用户编号</div></td>
                  <td><div class="cell">{{ detailData.userId }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">AppId</div></td>
                  <td><div class="cell">{{ detailData.appId }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">OpenId</div></td>
                  <td><div class="cell">{{ detailData.openId }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">请求来源</div></td>
                  <td><div class="cell">{{ detailData.sourceName }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">请求内容</div></td>
                  <td><div class="cell">{{ detailData.requestContent }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">回复内容</div></td>
                  <td><div class="cell">{{ detailData.replyContent }}</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <div slot="header">
            <span>匹配记录</span>
          </div>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <el-timeline v-loading="loading" :reverse="reverse" >
              <template v-for="item in matchList">
                <el-timeline-item :timestamp="'层级:'+item.level" type="primary" placement="top">
                  <el-card class="box-card">
                    <div slot="header" class="clearfix">
                      <span>
                        匹配度:<el-progress :percentage="parseInt((item.matchDegree*100).toFixed(0))" :color="customColors"></el-progress>
                      </span>
                    </div>
                    <div>
                      <p>{{item.qaConfigName}}</p>
                    </div>
                  </el-card>
                </el-timeline-item>
              </template>
            </el-timeline>
          </div>
        </el-card>
      </el-col>

    </el-row>
  </div>
</template>

<script>
  import {getUserQa} from "@/api/log/userQa";
  import {string2Json} from "@/utils/mulanbay";
  import {progressColors2} from "@/utils/mulanbay";

export default {
  name: "UserQaDetail",
  props: {
    //父层带过来的信息值
    userQaData: {
      id:undefined
    }
  },
  data() {
    return {
      detailData:{},
      matchList:[],
      reverse:false,
      loading:false,
      //进度百分比颜色
      customColors: progressColors2
    };
  },
  created() {
    this.handleReceiveData(this.userQaData);
  },
  //监听父层带过来的账户信息值
  watch:{
    userQaData: {
      deep: true,
      handler(val) {
        this.userQaData =val;
        this.handleReceiveData(this.userQaData);
      }
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.reset();
      this.loadUserQa(data.id);
    },
    //加载明细
    loadUserQa(id){
      if(id==undefined|| id==null){
        return;
      }
      getUserQa(id).then(response => {
        this.detailData = response;
        if(response.matchInfo!=null){
          this.matchList = string2Json(response.matchInfo);
        }
      });
    },
    // 表单重置
    reset() {

    }
  }
};
</script>
