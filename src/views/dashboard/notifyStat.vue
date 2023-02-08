<template>
  <div class="app-container">
    <div class="block">
      <div align="right">
        <span class="link-type" @click="handleDispatch('UserNotify')"><i class="el-icon-more" />更多</span>
      </div>
      <el-carousel v-loading="loading" height="295px">
        <el-carousel-item v-for="item in notifyData" :key="item.id">
          <div>
            <el-descriptions class="margin-top" title="提醒统计" :column="1" :size="size" border labelStyle="width: 100px">
              <el-descriptions-item>
                <template slot="label">
                  <i class="el-icon-info"></i>
                  提醒名称
                </template>
                <div class="cell">{{ item.userNotify.title }}</div>
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
