export function translateAuthError(message: string) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("invalid login credentials")) {
    return "邮箱或密码不正确。";
  }

  if (lowerMessage.includes("email not confirmed")) {
    return "邮箱还没有确认，请先查看邮箱并完成确认。";
  }

  if (lowerMessage.includes("user already registered") || lowerMessage.includes("already registered")) {
    return "这个邮箱已经注册过，请直接登录。";
  }

  if (lowerMessage.includes("password should be at least") || lowerMessage.includes("weak password")) {
    return "密码强度不够，请至少输入 6 位密码。";
  }

  if (lowerMessage.includes("email address is invalid") || lowerMessage.includes("email_address_invalid")) {
    return "邮箱格式不正确，请检查后重试。";
  }

  if (lowerMessage.includes("rate limit") || lowerMessage.includes("too many")) {
    return "操作太频繁，请稍后再试。";
  }

  if (lowerMessage.includes("signup") && lowerMessage.includes("disabled")) {
    return "当前暂时不允许注册，请检查 Supabase 的邮箱注册设置。";
  }

  return message || "操作失败，请稍后再试。";
}

export function translateDatabaseError(message: string) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("row-level security")) {
    return "没有权限操作这条账单。";
  }

  if (lowerMessage.includes("violates check constraint")) {
    return "账单内容不符合要求，请检查类型、分类和金额。";
  }

  if (lowerMessage.includes("invalid input syntax")) {
    return "输入格式不正确，请检查后重试。";
  }

  return message || "账单操作失败，请稍后再试。";
}
