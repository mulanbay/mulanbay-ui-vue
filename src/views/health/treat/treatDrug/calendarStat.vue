<template>
  <el-row :gutter="0">
    <el-col :span="6">
      <el-badge :value="statData.unTakes" class="item">
        <el-button size="small" icon="el-icon-error" type="danger" plain>未服用</el-button>
      </el-badge>
    </el-col>
    <el-col :span="6">
      <el-badge :value="statData.takes" class="item">
        <el-button size="small" icon="el-icon-success" type="success" plain>已服用</el-button>
      </el-badge>
    </el-col>
    <el-col :span="6">
      <el-badge :value="statData.unMatchs" class="item">
        <el-button size="small" icon="el-icon-question" type="warning" plain>未匹配</el-button>
      </el-badge>
    </el-col>
    <el-col :span="6">
      <el-badge :value="statData.drugs" class="item">
        <el-button size="small" icon="el-icon-info" type="primary" plain>药品数</el-button>
      </el-badge>
    </el-col>
  </el-row>

</template>

<script>

export default {
  name: "CalendarStat",
  props: {
    statData: {
      type: Object
    }
  },
  data() {
    return {

    };
  },
  //监听父层带过来的账户信息值
  watch:{
    statData(newVal,oldVal){
      this.statData = newVal;
    }
  },
  created() {
  },
  methods: {

  }
}
</script>
<style>
  .el-col {
    border-radius: 4px;
    text-align: center;
  }

</style>
