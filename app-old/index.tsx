import { View } from "react-native";
import MyButton from "../app-example/components/MyButton";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <MyButton />
    </View>
  );
}


// import { Text, View } from "react-native";

// export default function Index() {
//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: "#8BDFDD",
//       }}
//     >
//       <Text>Hello World!  My  name  is React Native</Text>
//     </View>
//   );
// }
