import React from "react";
import { Text } from "@fluentui/react";
import Summit from "../services/summit";
import { observer } from "mobx-react";
import { ServiceType } from "../constants/enums";

const App: React.FC = observer(() => {
  const context = Summit.getService(ServiceType.Summit);
  return (
    <div>
      <Text>Hello, {context.username}!</Text>
    </div>
  );
});

export default App;
