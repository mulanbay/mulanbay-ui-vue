<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
        <div style="text-align: left;">
          <el-form :model="queryParams" ref="queryForm" :inline="true">
            <el-form-item>
              <el-button type="stat" icon="el-icon-refresh" size="mini" @click="handleQuery" v-hasPermi="['system:cache:query']">刷新</el-button>
              <el-button type="query" icon="el-icon-info" size="mini" @click="handleMoreDetail" v-hasPermi="['system:systemMonitor:query']">更多详情</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
      <el-col :span="12" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <pie-chart :chartData="commandChartData"/>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <gauge-chart :chartData="useChartData"/>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" class="card-box">
        <el-card>
          <div slot="header">
            <span>统计信息</span>
          </div>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <tbody>
                <tr>
                  <td><div class="cell">Redis版本</div></td>
                  <td><div class="cell" v-if="cache.info">{{ cache.info.redis_version }}</div></td>
                  <td><div class="cell">运行模式</div></td>
                  <td><div class="cell" v-if="cache.info">{{ cache.info.redis_mode == "standalone" ? "单机" : "集群" }}</div></td>
                  <td><div class="cell">端口</div></td>
                  <td><div class="cell" v-if="cache.info">{{ cache.info.tcp_port }}</div></td>
                  <td><div class="cell">客户端数</div></td>
                  <td><div class="cell" v-if="cache.info">{{ cache.info.connected_clients }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">运行时间(天)</div></td>
                  <td><div class="cell" v-if="cache.info">{{ cache.info.uptime_in_days }}</div></td>
                  <td><div class="cell">使用内存</div></td>
                  <td><div class="cell" v-if="cache.info">{{ cache.info.used_memory_human }}</div></td>
                  <td><div class="cell">使用CPU</div></td>
                  <td><div class="cell" v-if="cache.info">{{ parseFloat(cache.info.used_cpu_user_children).toFixed(2) }}</div></td>
                  <td><div class="cell">内存配置</div></td>
                  <td><div class="cell" v-if="cache.info">{{ cache.info.maxmemory_human }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">AOF是否开启</div></td>
                  <td><div class="cell" v-if="cache.info">{{ cache.info.aof_enabled == "0" ? "否" : "是" }}</div></td>
                  <td><div class="cell">RDB是否成功</div></td>
                  <td><div class="cell" v-if="cache.info">{{ cache.info.rdb_last_bgsave_status }}</div></td>
                  <td><div class="cell">Key数量</div></td>
                  <td><div class="cell" v-if="cache.dbSize">{{ cache.dbSize }} </div></td>
                  <td><div class="cell">网络入口/出口</div></td>
                  <td><div class="cell" v-if="cache.info">{{ cache.info.instantaneous_input_kbps }}kps/{{cache.info.instantaneous_output_kbps}}kps</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

    </el-row>

    <!-- 更多详情 -->
    <el-dialog :title="sdTitle" width="650px" :visible.sync="sdOpen" customClass="customDialogCss">
      <more-detail :jsonData="jsonData"/>
    </el-dialog>


  </div>
</template>

<script>
  import {info} from "@/api/system/cache";

  import PieChart from '../../chart/pieChart'
  import GaugeChart from '../../chart/gauge'
  import MoreDetail from '../../common/jsonTreeTable'

export default {
  name: "Cache",
  components: {
    'pie-chart':PieChart,
    'gauge-chart':GaugeChart,
    'more-detail':MoreDetail
  },
  data() {
    return {
      // 加载层信息
      loading: [],
      loadingOptions:this.loadingOptions,
      queryParams:{},
      commandChartData:{},
      useChartData:{},
      //缓存信息
      cache:{},
      //更多详情
      sdTitle:undefined,
      sdOpen:false,
      jsonData:undefined
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 更多详情按钮操作 */
    handleMoreDetail(){
      this.sdTitle='更多详情';
      this.sdOpen=true;
      this.jsonData = Object.assign({}, this.jsonData, {
        jsonObject: this.cache.info
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 查询服务器信息 */
    getList() {
      this.openLoading();
      info().then(
        response => {
          //命令图表
          this.commandChartData = response.commandStats;
          this.commandChartData.showLegend = false;
          //内存使用图表
          let ucd={};
          let p = response.info.used_memory_peak_perc.replace('%','');
          ucd.value = p;
          ucd.name = '峰值:'+response.info.used_memory_peak_human;
          ucd.title='内存消耗';
          this.useChartData = ucd;
          this.cache = response;
          this.loading.close();
        }
      );
    },
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    }
  }
};
</script>
<style lang="scss" scoped>
@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
