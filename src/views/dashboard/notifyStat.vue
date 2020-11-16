<template>
  <div class="app-container">
    <div class="block">
      <div align="right">
        <span class="link-type" @click="handleDispatch"><i class="el-icon-more" />更多</span>
      </div>
      <el-carousel v-loading="loading" height="295px">
        <el-carousel-item v-for="item in notifyData" :key="item.id">
          <div class="el-table el-table--enable-row-hover el-table--medium" align="center">
            <table cellspacing="0" style="width: 100%;">
              <thead>
                <tr>
                  <th class="is-leaf"><div class="cell" align="center">字段</div></th>
                  <th class="is-leaf"><div class="cell" align="center">数值</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><div class="cell" align="center">提醒名称</div></td>
                  <td><div class="cell" align="center">{{ item.userNotify.title }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell" align="center">统计值</div></td>
                  <td>
                    <div class="cell" align="center">
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
                  <td><div class="cell" align="center">警告值</div></td>
                  <td><div class="cell" align="center">{{ item.userNotify.warningValue+item.userNotify.unit }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell" align="center">报警值</div></td>
                  <td><div class="cell" align="center">{{ item.userNotify.alertValue+item.userNotify.unit }}</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>

<script>
  import {fetchList} from "@/api/report/notify/notifyStat";

export default {
  name: "NotifyStat",
  data() {
    return {
      loading:false,
      notifyData:[]
    };
  },
  created() {
    this.getStatList();
  },
  methods: {
    //跳转
    handleDispatch(){
      //路由定向
      this.$router.push({name:'UserNotify',query: {}})
    },
    getStatList(){
      const para ={
        showInIndex:true,
        status:'ENABLE',
        page:-1
      };
      this.loading=true;
      fetchList(para).then(
        response => {
          const n = response.rows.length;
          let list = new Array();
          for(let i=0;i<n;i++){
            let dd = response.rows[i];
            dd.content=dd.compareValue+dd.userNotify.unit;
            if(dd.userNotify.notifyConfig.resultType=='NAME_DATE'||dd.userNotify.notifyConfig.resultType=='NAME_NUMBER'){
              dd.content=dd.name+dd.compareValue+dd.userNotify.unit;
            }
            list.push(dd);
          }
          this.notifyData = list;
          this.loading=false;
        }
      );
    }
  }
};
</script>
