<template>
  <div id="app">
    <div class="demo">
      <vue-schedule comId="scheduleComponent1"
                    :timeSetp="0.5"></vue-schedule>
      <vue-schedule comId="scheduleComponent2"
                    :timeSetp="1"></vue-schedule>
      <vue-schedule comId="scheduleComponent3"
                    :timeSetp="0.25"></vue-schedule>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {
    }
  }
}
</script>

<style scoped lang="less">
.demo {
  display: block;
  width: 800px;
  margin: 0 auto;
  padding-top: 20px;
  background-color: #fff;
  & > p {
    height: 500px;
  }
}
</style>
