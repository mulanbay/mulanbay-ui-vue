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
      </el-form-item>
    </el-form>

    <el-row v-loading="loading" >
      <template v-for="item in notifyStatList">
        <el-col :span="12" class="card-box">
          <el-card>
            <el-col :span="12">
              <div class="el-table el-table--enable-row-hover el-table--medium">
              <table cellspacing="0" style="width: 100%;">
                <tbody>
                  <tr>
                    <td><div class="cell">提醒名称</div></td>
                    <td>
                      <div class="cell">
                      {{ formatName(item) }}
                      <span class="link-type" @click="handleDispatch(item.userNotify.notifyConfig.url)"><i class="el-icon-s-promotion" /></span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td><div class="cell">统计值</div></td>
                    <td>
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
                    </td>
                  </tr>
                  <tr>
                    <td><div class="cell">警告值</div></td>
                    <td><div class="cell">{{ item.userNotify.warningValue+item.userNotify.unit }}</div></td>
                  </tr>
                  <tr>
                    <td><div class="cell">报警值</div></td>
                    <td><div class="cell">{{ item.userNotify.alertValue+item.userNotify.unit }}</div></td>
                  </tr>
                  <tr>
                    <td><div class="cell">比较类型</div></td>
                    <td><div class="cell">{{ item.userNotify.notifyConfig.notifyTypeName }}</div></td>
                  </tr>
                </tbody>
              </table>
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
                  <tr>
                    <td align="center"></td>
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
  import {fetchList} from "@/api/report/notify/notifyStat";
  import {getPercent} from "@/utils/planUtils";

export default {
  name: "NotifyStatList",
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
    /** 格式化名称，计算各数值 */
    formatName(row){
      row.wr = getPercent(row.compareValue,row.userNotify.warningValue);
      row.ar = getPercent(row.compareValue,row.userNotify.alertValue);
      return row.userNotify.title;
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
