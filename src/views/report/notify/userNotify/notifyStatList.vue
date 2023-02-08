<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['report:notify:userNotify:notifyStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-refresh" size="mini" @click="resetStat"  v-hasPermi="['report:notify:userNotify:deleteCache']">强制刷新</el-button>
      </el-form-item>
    </el-form>

    <el-row v-loading="loading" >
      <template v-for="item in notifyStatList">
        <el-col :span="12" class="card-box">
          <el-card>
            <el-col :span="12">
              <div >
                <el-descriptions class="margin-top" :column="1" :size="size" border labelStyle="width: 100px">
                  <el-descriptions-item>
                    <template slot="label">
                      <i class="el-icon-info"></i>
                      提醒名称
                    </template>
                    <div class="cell">
                      <el-tooltip class="item" effect="dark" :content="item.userNotify.title" placement="top">
                         <el-button size="mini" round plain type="success">
                           {{ formatTitle(item.userNotify.title) }}
                         </el-button>
                      </el-tooltip>
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template slot="label">
                      <i class="el-icon-s-data"></i>
                      统计值
                    </template>
                    <div class="cell">
                      <span v-if="item.overAlertValue>0" style="color:red ;">
                       {{ item.content }}
                      </span>
                      <span v-else-if="item.overWarningValue>0" style="color:BlueViolet ;">
                       {{ item.content }}
                      </span>
                      <span v-else style="color:#2E8B57 ;">
                        {{ item.content }}
                        <i class="el-icon-success" />
                      </span>
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template slot="label">
                      <i class="el-icon-warning"></i>
                      警告值
                    </template>
                    <div class="cell">{{ item.userNotify.warningValue+item.userNotify.unit }}</div>
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template slot="label">
                      <i class="el-icon-star-on"></i>
                      报警值
                    </template>
                    <div class="cell">{{ item.userNotify.alertValue+item.userNotify.unit }}</div>
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template slot="label">
                      <i class="el-icon-d-caret"></i>
                      比较类型
                    </template>
                    <div class="cell">{{ item.userNotify.notifyConfig.notifyTypeName }}</div>
                  </el-descriptions-item>
              </el-descriptions>
              </div>
            </el-col>
            <el-col :span="12">
              <div>
              <table cellspacing="0" style="width: 100%;">
                <tbody>
                  <tr>
                    <td align="center">
                      <span v-if="'MORE'==item.userNotify.notifyConfig.notifyType">
                       <el-progress type="dashboard" :percentage="item.wr" :color="moreColors"></el-progress>
                      </span>
                      <span v-else>
                       <el-progress type="dashboard" :percentage="item.wr" :color="lessColors"></el-progress>
                      </span>
                    </td>
                    <td align="center">
                      <span v-if="'MORE'==item.userNotify.notifyConfig.notifyType">
                       <el-progress type="dashboard" :percentage="item.ar" :color="moreColors"></el-progress>
                      </span>
                      <span v-else>
                       <el-progress type="dashboard" :percentage="item.ar" :color="lessColors"></el-progress>
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td align="center"><div class="cell"><i class="el-icon-info"></i>警告比例</div></td>
                    <td align="center"><div class="cell"><i class="el-icon-info"></i>报警比例</div></td>
                  </tr>
                  <tr align="center">
                    <td align="center" colspan="2">
                      </br>
                      <el-button type="primary" icon="el-icon-refresh" size="mini" @click="refreshStat(item.userNotify.id)"  v-hasPermi="['report:notify:userNotify:deleteCache']">刷新</el-button>
                      <el-button type="primary" icon="el-icon-s-promotion" size="mini" @click="handleDispatch(item.userNotify.notifyConfig.url)"  v-hasPermi="['report:notify:userNotify:deleteCache']">详情</el-button>
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
            </el-col>
          </el-card>
        </el-col>
      </template>
    </el-row>

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
  import {fetchList,deleteCache} from "@/api/report/notify/notifyStat";
  import {getPercent} from "@/utils/planUtils";
  import {ellipsis} from "@/utils/mulanbay";

export default {
  name: "UserNotifyNotifyStatList",
  data() {
    return {
      //大于类进度显示环颜色
      moreColors: [
        {color: '#f56c6c', percentage: 20},
        {color: '#e6a23c', percentage: 40},
        {color: '#6f7ad3', percentage: 60},
        {color: '#1989fa', percentage: 80},
        {color: '#5cb87a', percentage: 100}
      ],
      //小于类进度显示环颜色
      lessColors: [
        {color: '#f56c6c', percentage: 100},
        {color: '#e6a23c', percentage: 80},
        {color: '#6f7ad3', percentage: 60},
        {color: '#1989fa', percentage: 40},
        {color: '#5cb87a', percentage: 20}
      ],
      // 遮罩层
      loading: false,
      // 总条数
      total: 0,
      // 列表数据
      notifyStatList:[],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        status:'ENABLE',
        name:undefined
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    //路由跳转
    handleDispatch(name) {
      //路由定向
      this.$router.push({name:name,query: {}})
    },
    /** 强制刷新 */
    resetStat(){
      this.$confirm('强制刷新会删除所有的统计缓存，从而进行实时统计，速度会有点慢，是否确定要刷新?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteCache({});
        }).then(() => {
          this.getList();
          this.msgSuccess("刷新成功");
        }).catch(function() {});
    },
    /** 刷新单个 */
    refreshStat(userNotifyId){
      let para ={
        userNotifyId: userNotifyId
      };
      deleteCache(para);
      this.msgSuccess("刷新成功");
      this.getList();
    },
    /** 省略显示 */
    formatTitle(title){
      let s = ellipsis(title,8);
      return s;
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.queryParams).then(
        response => {
          //需要拼装成和用户计划一样的数据
          let list = new Array();
          const n = response.rows.length;
          for(let i=0;i<n;i++){
            let dd = response.rows[i];
            dd.content=dd.compareValue+dd.userNotify.unit;
            if(dd.userNotify.notifyConfig.resultType=='NAME_DATE'||dd.userNotify.notifyConfig.resultType=='NAME_NUMBER'){
              dd.content=dd.name+dd.compareValue+dd.userNotify.unit;
            }
            dd.wr = getPercent(dd.compareValue,dd.userNotify.warningValue);
            dd.ar = getPercent(dd.compareValue,dd.userNotify.alertValue);
            list.push(dd);
          }
          this.notifyStatList = list;
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
    }
  }
};
</script>
